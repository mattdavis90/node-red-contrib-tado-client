# Tado Web API Node with shared config

[![Node.js Package](https://github.com/mattdavis90/node-red-contrib-tado-client/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/mattdavis90/node-red-contrib-tado-client/actions/workflows/npm-publish.yml)

### Note: From v0.9.0 onward this node requires at least nodejs v12 due to using async functions.

A <a href="http://nodered.org" target="_new">Node-RED</a> node with the shared configuration that lets you connect to the Tado Web API.

*Please note: The library used by this node is derived from reverse engineering the Tado Web API and hence may be unstable.*

## Install

Run the following command in the root directory of your Node-RED install or home directory (usually ~/.node-red) and will also install
needed libraries.

```
npm install node-red-contrib-tado-client
```

## Usage

First, create a Tado Config node and enter your Tado username and password. This node connects to the Tado Web API and gets an OAuth2
token for further transactions.

You can create multiple Tado nodes, each of which interacts with a single end-point on the Tado API.

The node is triggered by each message on the input, regardless of content. This allows creating flows using other Nodes to
trigger the API. If the message on the input contains any of the following fields then they will ovewrite the properties on the node.

* Account:
  - getMe (msg.homeId)

* Home:
  - getAirComfort (msg.homeId)
  - getAirComfortDetailed (msg.homeId)
  - getHeatingCircuits (msg.homeId)
  - getHome (msg.homeId)
  - getInstallations (msg.homeId)
  - getState (msg.homeId)
  - getUsers (msg.homeId)
  - getWeather (msg.homeId)

* Zone:
  - getZones (msg.homeId)
  - clearZoneOverlay (msg.homeId, msg.zoneId)
  - getAwayConfiguration (msg.homeId, msg.zoneId)
  - getTimeTable (msg.homeId, msg.zoneId, msg.timetableId)
  - getTimeTables (msg.homeId, msg.zoneId)
  - getZoneCapabilities (msg.homeId, msg.zoneId)
  - getZoneControl (msg.homeId, msg.zoneId)
  - getZoneDayReport (msg.homeId, msg.zoneId, msg.reportDate)
  - getZoneOverlay (msg.homeId, msg.zoneId)
  - getZoneState (msg.homeId, msg.zoneId)
  - getZoneStates (msg.homeId)
  - setOpenWindowMode (msg.homeId, msg.zoneId, msg.openWindowMode)
  - setZoneOverlay (msg.homeId, msg.zoneId, msg.power, msg.temperature, msg.terminationType, msg.fanSpeed, msg.acMode)

* Device:
  - getDevices (msg.homeId)
  - getDeviceTemperatureOffset (msg.deviceId)
  - identifyDevice (msg.deviceId)
  - setChildlock (msg.deviceId, msg.childlock)
  - setDeviceTemperatureOffset (msg.deviceId, msg.temperatureOffset)
  - setWindowDetection (msg.homeId, msg.zoneId, msg.windowDetection, msg.windowDetectionTimeout)

* Mobile Device:
  - getMobileDevices (msg.homeId)
  - getMobileDevice (msg.homeId, msg.deviceId)
  - getMobileDeviceSettings (msg.homeId, msg.deviceId)
  - setGeoTracking (msg.homeId, msg.deviceId, msg.geoTracking)

* Presence:
  - isAnyoneAtHome (msg.homeId)
  - setPresence (msg.homeId)
  - updatePresence (msg.homeId)

* Energy IQ:
  - getEnergyIQ (msg.homeId)
  - getEnergyIQTariff (msg.homeId)
  - addEnergyIQTariff (msg.homeId, msg.unit, msg.startDate, msg.endDate, msg.tariffInCents)
  - updateEnergyIQTariff (msg.homeId, msg.tariffId, msg.unit, msg.startDate, msg.endDate, msg.tariffInCents)
  - getEnergyIQMeterReadings (msg.homeId)
  - addEnergyIQMeterReading (msg.homeId, msg.readingDate, msg.reading)
  - deleteEnergyIQMeterReading (msg.homeId)


### Note: For AC users - Tado changed from FanSpeed to FanLevel. If you zone shows FanLevel then please use Level1, Level2, etc. as the FanSpeed parameter, otherwise use High, Medium, Low.

The response from the Tado API is represented in ```msg.payload``` and the generating API call is ```msg.topic```.

## Credits

This node is based on the work of [SCPhillips](http://blog.scphillips.com/posts/2017/01/the-tado-api-v2/)
