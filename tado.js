/**
 * @param { import("node-red").NodeAPI } RED
 */
module.exports = function(RED) {
	"use strict";
	const { Tado } = require('node-tado-client');

	/**
	 * Config node
	 */
	function TadoConfigNode(config) {
		RED.nodes.createNode(this, config);
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
	function TadoNode(config) {
		RED.nodes.createNode(this, config);
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
			"reading",			
			"readingDate",
			"readingId",
			"reportDate",
			"startDate",
			"endDate",
			"presence",
			"tariffId",
			"temperatureOffset",
			"timetableId",
			"geoTracking",
			"windowDetection",
			"windowDetectionTimeout",
			"unit",
			"tariffInCents",
			"openWindowMode",
			"childlock",
			"configName",
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
						//console.log(err);						
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

				case "getAirComfort":
				case "getAirComfortDetailed":
				case "getDevices":
				case "getEnergyIQ":
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

				case "setZoneOverlay": {
					const type = arg("terminationType");
					const termination = type === "timer" ? arg("terminationTimeout") : type;
					call(arg("homeId"), arg("zoneId"), arg("power"), arg("temperature"), termination, arg("fanSpeed"), arg("acMode"));
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
					call(arg("homeId"), arg("unit"), arg("startDate"), arg("endDate"), Number(arg("tariffInCents")));
					break;

				case "updateEnergyIQTariff":
					call(arg("homeId"), arg("tariffId"), arg("unit"), Number(arg("tariffInCents")));
					break;
					
				case "addEnergyIQMeterReading":
					call(arg("homeId"), arg("readingDate"), parseInt(arg("reading"), 10));
					break;
					
				case "deleteEnergyIQMeterReading":				
					call(arg("homeId"), arg("readingId"));
					break;
					
				default:
					node.error(`invalid apiCall "${apiCall}"`);
					break;
			}
		});
	}

	RED.nodes.registerType("tado", TadoNode);
}
