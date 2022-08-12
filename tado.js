module.exports = function(RED) {
    "use strict";
    const Tado = require('node-tado-client');

    /**
     * Config node
     */
    function TadoConfigNode(input) {
        RED.nodes.createNode(this, input);
        const node = this;

        node.tado = new Tado(node.credentials.username, node.credentials.password);

        node.call = async function(method) {
            const args = [...arguments].slice(1);
            return node.tado[method](...args);
        }
    }

    RED.nodes.registerType("tado-config", TadoConfigNode, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" },
        }
    });

    /**
     * Tado node
     */
    function TadoNode(input) {
        RED.nodes.createNode(this, input);
        const node = this;

        [
            "apiCall",
            "homeId",
            "deviceId",
            "zoneId",
            "power",
            "temperature",
            "terminationType",
            "terminationTimeout",
            "fanSpeed",
            "acMode",
            "name",
            "reportDate",
            "presence",
            "temperatureOffset",
            "geoTracking",
            "windowDetection",
            "windowDetectionTimeout",
            "openWindowMode",
            "configName"
        ].forEach(k => node[k] = input[k]);

        node.tadoConfig = RED.nodes.getNode(node.configName);

        if (!node.tadoConfig) {
            node.status({ fill: "grey", shape: "ring", text: "unconfigured" });
            node.error(RED._("tado.errors.missingconfig"));
            return;
        }

        node.on("input", (msg, send, done) => {
            const arg = name => msg.hasOwnProperty(name) ? msg[name] : node[name];
            const bool = x => x === true || x === "true" || x === "True";
            const apiCall = arg("apiCall");
            const call = function() {
                node.tadoConfig.call(apiCall, ...arguments).then(resp => {
                    node.status({ fill: "green", shape: "dot", text: apiCall });
                    msg.payload = resp;
                    if(send != null){
                        send(msg);
                    } else {
                        node.send(msg);
                    }
                }).catch(err => {
                    node.status({ fill: "red", shape: "ring", text: "errored" });
                    if(done != null){
                        done(err); // Node-RED 1.0 compatible
                    } else {
                        node.error(err, msg); // Node-RED 0.x compatible
                    }
                });
            }

            msg.topic = apiCall;

            switch(apiCall) {
                case "getMe":
                    call();
                    break;
                case "getHome":
                    call(arg("homeId"));
                    break;
                case "getWeather":
                    call(arg("homeId"));
                    break;
                case "getDevices":
                    call(arg("homeId"));
                    break;
                case "getDeviceTemperatureOffset":
                    call(arg("deviceId"));
                    break;
                case "getInstallations":
                    call(arg("homeId"));
                    break;
                case "getUsers":
                    call(arg("homeId"));
                    break;
                case "getState":
                    call(arg("homeId"));
                    break;
                case "getMobileDevices":
                    call(arg("homeId"));
                    break;
                case "getMobileDevice":
                    call(arg("homeId"), arg("deviceId"));
                    break;
                case "getMobileDeviceSettings":
                    call(arg("homeId"), arg("deviceId"));
                    break;
                case "setGeoTracking":
                    call(arg("homeId"), arg("deviceId"), bool(arg("geoTracking")));
                    break;
                case "getZones":
                    call(arg("homeId"));
                    break;
                case "getZoneState":
                    call(arg("homeId"), arg("zoneId"));
                    break;
                case "getZoneCapabilities":
                    call(arg("homeId"), arg("zoneId"));
                    break;
                case "getZoneOverlay":
                    call(arg("homeId"), arg("zoneId"));
                    break;
                case "getZoneDayReport":
                    call(arg("homeId"), arg("zoneId"), arg("reportDate"));
                    break;
                case "getTimeTables":
                    call(arg("homeId"), arg("zoneId"));
                    break;
                case "getAwayConfiguration":
                    call(arg("homeId"), arg("zoneId"));
                    break;
                case "getTimeTable":
                    call(arg("homeId"), arg("zoneId"), arg("timetableId"));
                    break;
                case "clearZoneOverlay":
                    call(arg("homeId"), arg("zoneId"));
                    break;
                case "setZoneOverlay": {
                    const type = arg("terminationType");
                    const termination = type === "timer" ? arg("terminationTimeout") : type;
                    call(arg("homeId"), arg("zoneId"), arg("power"), arg("temperature"), termination, arg("fanSpeed"), arg("acMode"));
                    break;
                }
                case "setDeviceTemperatureOffset":
                    call(arg("deviceId"), arg("temperatureOffset"));
                    break;
                case "identifyDevice":
                    call(arg("deviceId"));
                    break;
                case "setPresence":
                    call(arg("homeId"), arg("presence"));
                    break;
                case "isAnyoneAtHome":
                    call(arg("homeId"));
                    break;
                case "updatePresence":
                    call(arg("homeId"));
                    break;
                case "setWindowDetection":
                    call(arg("homeId"), arg("zoneId"), bool(arg("windowDetection")), arg("windowDetectionTimeout"));
                    break;
                case "setOpenWindowMode":
                    call(arg("homeId"), arg("zoneId"), bool(arg("openWindowMode")));
                    break;
                case "getAirComfort":
                    call(arg("homeId"));
                    break;
                case "getAirComfortDetailed":
                    call(arg("homeId"));
                    break;
                case "clearZoneOverlays":
					const zoneIds = [arg("zoneId")]; 
                    call(arg("homeId"), zoneIds);
                    break;
                case "setZoneOverlays":
                    const type = arg("terminationType");
                    const termination = type === "timer" ? arg("terminationTimeout") : type;
                    const overlays = [{
                                        "zone_id": arg("zoneId"),
                                        "power": arg("power"),
                                        "temperature": { "celsius": arg("temperature")},
                                        "mode": arg("acMode"),
                                        "fanLevel": arg("fanSpeed"),
                                        "verticalSwing": "OFF",
                                        "horizontalSwing": "ON",
                                        "light": "OFF"
                                      }];
                    call(arg("homeId"), overlays , termination);
                    break;
                default:
                    node.error(`invalid apiCall "${apiCall}"`);
                    break;
            }
        });
    }

    RED.nodes.registerType("tado", TadoNode);
}
