/**
 * @param { import("node-red").NodeAPI } RED
 */
module.exports = function(RED) {
    "use strict";
    const { TadoX } = require('node-tado-client');

    /**
     * Config node
     */
    function TadoXConfigNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.tado = new TadoX(node.credentials.username, node.credentials.password);

        node.call = async function(method) {
            const args = [...arguments].slice(1);
            return node.tado[method](...args);
        }
    }

    RED.nodes.registerType("tadox-config", TadoXConfigNode, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" },
        }
    });

    /**
     * Tado node
     */
    function TadoXNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        [
            "apiCall",
            "childlock",
            "configName",
            "deviceId",
            "endDate",
            "geoTracking",
            "homeId",
            "maxTemperature",
            "name",
            "power",
            "presence",
            "quickAction",
            "reading",
            "readingDate",
            "readingId",
            "reportDate",
            "roomId",
            "startDate",
            "tariffId",
            "tariffInCents",
            "temperature",
            "temperatureOffset",
            "terminationTimeout",
            "terminationType",
            "timetableId",
            "unit",
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

            msg.topic = apiCall;

            switch (apiCall) {
                case "getMe":
                    call();
                    break;

                case "disableFlowTemperatureOptimization":
                case "enableFlowTemperatureOptimization":
                case "getActionableDevices":
                case "getAirComfort":
                case "getAirComfortDetailed":
                case "getEnergyIQMeterReadings":
                case "getEnergyIQTariff":
                case "getFeatures":
                case "getFlowTemperatureOptimization":
                case "getHeatingCircuits":
                case "getHome":
                case "getHomeSummary":
                case "getInstallations":
                case "getMobileDevices":
                case "getRooms":
                case "getRoomsAndDevices":
                case "getState":
                case "getUsers":
                case "getWeather":
                case "isAnyoneAtHome":
                case "updatePresence":
                    call(arg("homeId"));
                    break;

                case "performQuickAction":
                    call(arg("homeId"), arg("quickAction"));
                    break;

                case "setFlowTemperatureOptimization":
                    call(arg("homeId"), arg("maxTemperature"));
                    break;

                case "getRoomState":
                case "resumeSchedule":
                    call(arg("homeId"), arg("roomId"));
                    break;

                case "manualControl": {
                    const type = arg("terminationType");
                    const termination = type === "timer" ? arg("terminationTimeout") : type;
                    call(arg("homeId"), arg("roomId"), arg("power"), termination, arg("temperature"));
                    break;
                }

                case "setChildlock":
                    call(arg("homeId"), arg("deviceId"), bool(arg("childlock")));
                    break;

                case "setDeviceTemperatureOffset":
                    call(arg("homeId"), arg("deviceId"), arg("temperatureOffset"));
                    break;

                case "getMobileDevice":
                case "getMobileDeviceSettings":
                    call(arg("homeId"), arg("deviceId"));
                    break;

                case "setGeoTracking":
                    call(arg("homeId"), arg("deviceId"), bool(arg("geoTracking")));
                    break;

                case "setPresence":
                    call(arg("homeId"), arg("presence"));
                    break;

                case "addEnergyIQTariff":
                    call(arg("homeId"), arg("unit"), arg("startDate"), arg("endDate"), parseFloat(arg("tariffInCents").toFixed(2)));
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

    RED.nodes.registerType("tadox", TadoXNode);
}
