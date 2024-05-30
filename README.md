# Tado Web API Node with shared config

A <a href="http://nodered.org" target="_new">Node-RED</a> node with the shared configuration that lets you connect to the Tado Web API.

*Please note: The library used by this node is derived from reverse engineering the Tado Web API and hence may be unstable.*

> [!IMPORTANT]
> From v0.9.0 onward this node requires at least nodejs v12 due to using async functions.

## Installation

### Nodered Palette (Preferred)

You can install the node from the built-in Nodered palette. It is available on the menu in the top-right corner of Nodered, under the "Manage Palette" option; search for tado.

### Using NPM

Run the following command in the root directory of your Node-RED install or home directory (usually ~/.node-red) and will also install
needed libraries.

```
npm install node-red-contrib-tado-client
```

## Getting Started

### Install the Example Flow

There is an example flow available in the repo. I'd recommend giving it a go to trial the functionality available. [Link to example](https://github.com/mattdavis90/node-red-contrib-tado-client/blob/master/examples/tado.json)

The example can be installed from the Nodered menu in the top-right, then choose "Import", and paste the JSON from the example into the box. It
is a good idea to change the target to "New Flow" so you don't override any of your existing nodes. Once imported make sure to deploy the changes.

### Configure the Node

Open the Tado configuration node by selecting the Nodered menu and choosing "Configuration Nodes" then double clicking the "Tado Config" node
in the righthand sidebar. This will open the configuration window, here you can enter your Tado username and password, click update to save.
You can then press deploy to update your Nodered.


### Find your home_id

In order to use most API calls you'll need to know your Tado `home_id`. This can be found using the first example (`getMe`) from the example
flow. Make sure you've done the previous step and click the inject button to the left of the `getMe` node. You should see your `home_id`
in the debug message pane on the righthand side. You can now edit other Tado nodes to include this `home_id` value.

### Going further

You can create multiple Tado nodes, each of which interacts with a single end-point on the Tado API. Many are demoed in the example.

The node is triggered by each message on the input, regardless of content. This allows creating flows using other nodes to
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


> [!NOTE]
> For AC users - Tado changed from FanSpeed to FanLevel. If you zone shows FanLevel then please use Level1, Level2, etc. as the FanSpeed parameter, otherwise use High, Medium, Low.

The response from the Tado API is represented in ```msg.payload``` and the generating API call is ```msg.topic```.

## Credits

This node is based on the work of [SCPhillips](http://blog.scphillips.com/posts/2017/01/the-tado-api-v2/)
