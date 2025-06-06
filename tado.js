/**
 * @param { import("node-red").NodeAPI } RED
 */
module.exports = function(RED) {
    "use strict";
    const { Tado } = require('node-tado-client');

    /**
     * Tado Token Node
     */
    function TadoTokenNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const tadoConfig = RED.nodes.getNode(config.configName);
        tadoConfig.tado.setTokenCallback((token) => {
            const msg = {
                topic: "refresh_token",
                payload: token.refresh_token,
            };

            node.send(msg);
        });

        node.on('close', function() {
            tadoConfig.tado.setTokenCallback(undefined);
        });
    }

    RED.nodes.registerType("tado-token", TadoTokenNode);

    /**
     * Config node
     */
    function TadoConfigNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.tado = new Tado();

        node.call = async function(method) {
            const args = [...arguments].slice(1);
            return node.tado[method](...args);
        }
    }

    RED.nodes.registerType("tado-config", TadoConfigNode);

    /**
     * Tado node
     */
    function TadoNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        [
            "acMode",
            "apiCall",
            "childlock",
            "configName",
            "defaultTerminationTimeout",
            "defaultTerminationType",
            "deviceId",
            "endDate",
            "fanSpeed",
            "geoTracking",
            "homeId",
            "horizontalSwing",
            "month",
            "name",
            "openWindowMode",
            "power",
            "presence",
            "reading",
            "readingDate",
            "readingId",
            "reportDate",
            "startDate",
            "tariffId",
            "tariffInCents",
            "temperature",
            "temperatureOffset",
            "terminationTimeout",
            "terminationType",
            "timetableId",
            "unit",
            "verticalSwing",
            "windowDetection",
            "windowDetectionTimeout",
            "year",
            "zoneId",
        ].forEach((k) => {
            node[k] = config[k];
        });

        node.tadoConfig = RED.nodes.getNode(node.configName);

        if (!node.tadoConfig) {
            node.status({ fill: "grey", shape: "ring", text: "unconfigured" });
            node.error(RED._("tado.errors.missingconfig"));
            return;
        }

        node.on("input", (msg, send, done) => {
            const arg = (name) => {
                return msg.hasOwnProperty(name) ? msg[name] : node[name];
            }
            const bool = (x) => {
                return x === true || x === "true" || x === "True";
            }
            const apiCall = arg("apiCall");
            const call = function() {
                node.tadoConfig.call(apiCall, ...arguments).then(resp => {
                    node.status({ fill: "green", shape: "dot", text: apiCall });
                    msg.payload = resp;

                    if (send) {
                        send(msg);
                    } else {
                        node.send(msg);
                    }

                    if (done) {
                        done();
                    }
                }).catch(err => {
                    node.status({ fill: "red", shape: "ring", text: "errored" });
                    if (done) {
                        if (err.response) {
                            done(err.response.data);
                        } else if (err.request) {
                            done('No response received from the server');
                        } else {
                            done(err.message);
                        }
                    } else {
                        node.error(err, msg); // Node-RED 0.x compatible						
                    }
                });
            }

            const authenticate = function() {
                const refreshToken = msg["refreshToken"];

                node.tadoConfig.tado.authenticate(refreshToken).then(([verify, token]) => {
                    if (verify) {
                        const msg = {
                            topic: "authenticating",
                            payload: {
                                uri: verify.verification_uri_complete,
                                interval: verify.interval,
                                expires_in: verify.expires_in,
                            },
                        };

                        if (send) {
                            send(msg);
                        } else {
                            node.send(msg);
                        }
                    }

                    token.then(() => {
                        node.status({ fill: "green", shape: "dot", text: "Authenticated" });

                        if (done) {
                            done();
                        }
                    }).catch((err) => {
                        node.status({ fill: "red", shape: "ring", text: "Errored" });

                        if (done) {
                            done(err);
                        } else {
                            node.error(err, msg);
                        }
                    });
                }).catch((err) => {
                    node.status({ fill: "red", shape: "ring", text: "Errored" });

                    if (done) {
                        done(err);
                    } else {
                        node.error(err, msg);
                    }
                });
            }

            msg.topic = apiCall;

            switch (apiCall) {
                case "authenticate":
                    authenticate();
                    break;

                case "getMe":
                    call();
                    break;

                case "getAirComfort":
                case "getAirComfortDetailed":
                case "getDevices":
                case "getEnergyIQMeterReadings":
                case "getEnergyIQTariff":
                case "getHeatingCircuits":
                case "getHome":
                case "getInstallations":
                case "getMobileDevices":
                case "getState":
                case "getUsers":
                case "getWeather":
                case "getZones":
                case "getZoneStates":
                case "isAnyoneAtHome":
                case "updatePresence":
                    call(arg("homeId"));
                    break;

                case "clearZoneOverlay":
                case "getAwayConfiguration":
                case "getTimeTables":
                case "getZoneCapabilities":
                case "getZoneControl":
                case "getZoneDefaultOverlay":
                case "getZoneOverlay":
                case "getZoneState":
                    call(arg("homeId"), arg("zoneId"));
                    break;

                case "getDeviceTemperatureOffset":
                case "identifyDevice":
                    call(arg("deviceId"));
                    break;

                case "getMobileDevice":
                case "getMobileDeviceSettings":
                    call(arg("homeId"), arg("deviceId"));
                    break;

                case "setGeoTracking":
                    call(arg("homeId"), arg("deviceId"), bool(arg("geoTracking")));
                    break;

                case "getZoneDayReport":
                    call(arg("homeId"), arg("zoneId"), arg("reportDate"));
                    break;

                case "getTimeTable":
                    call(arg("homeId"), arg("zoneId"), arg("timetableId"));
                    break;

                case "setZoneDefaultOverlay": {
                    const type = arg("defaultTerminationType");
                    const termination = {
                        terminationCondition: {
                            type,
                            durationInSeconds: type == "TIMER" ? arg("defaultTerminationTimeout") : undefined,
                        },
                    };
                    call(arg("homeId"), arg("zoneId"), termination);
                    break;
                }

                case "setZoneOverlay": {
                    const type = arg("terminationType");
                    const termination = type === "timer" ? arg("terminationTimeout") : type;
                    call(arg("homeId"), arg("zoneId"), arg("power"), arg("temperature"), termination, arg("fanSpeed"), arg("acMode"), arg("verticalSwing"), arg("horizontalSwing"));
                    break;
                }

                case "setDeviceTemperatureOffset":
                    call(arg("deviceId"), arg("temperatureOffset"));
                    break;

                case "setChildlock":
                    call(arg("deviceId"), arg("childlock"));
                    break;

                case "setPresence":
                    call(arg("homeId"), arg("presence"));
                    break;

                case "setWindowDetection":
                    call(arg("homeId"), arg("zoneId"), bool(arg("windowDetection")), arg("windowDetectionTimeout"));
                    break;

                case "setOpenWindowMode":
                    call(arg("homeId"), arg("zoneId"), bool(arg("openWindowMode")));
                    break;

                case "addEnergyIQTariff":
                    call(arg("homeId"), arg("unit"), arg("startDate"), arg("endDate"), parseFloat(arg("tariffInCents").toFixed(2)));
                    break;

                case "getEnergyIQOverview":
                    call(arg("homeId"), arg("month"), arg("year"));
                    break;

                case "updateEnergyIQTariff":
                    call(arg("homeId"), arg("tariffId"), arg("unit"), arg("startDate"), arg("endDate"), parseFloat(arg("tariffInCents").toFixed(2)));
                    break;

                case "addEnergyIQMeterReading":
                    call(arg("homeId"), arg("readingDate"), parseInt(arg("reading"), 10));
                    break;

                case "deleteEnergyIQMeterReading":
                    call(arg("homeId"), arg("readingId"));
                    break;

                default:
                    if (typeof node.tadoConfig.tado[apiCall] === "function") {
                        if (Array.isArray(msg.payload)) {
                            call(...msg.payload);
                        } else {
                            call(msg.payload);
                        }
                    } else {
                        node.error(`invalid apiCall "${apiCall}"`);
                    }
                    break;
            }
        });
    }

    RED.nodes.registerType("tado", TadoNode);
}
