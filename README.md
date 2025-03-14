# Tado Web API Node with shared config

A <a href="http://nodered.org" target="_new">Node-RED</a> node with the shared
configuration that lets you connect to the Tado Web API.

*Please note: The library used by this node is derived from reverse engineering
the Tado Web API and hence may be unstable.*

> [!IMPORTANT]  
> Tado has changed how authentication works! They no longer accept
> username/password based authentication. As such, this library has switched to
> the Oauth device flow. This is effective as of v1.0.0. Please upgrade ASAP to
> avoid broken integrations. See the `examples/tado.json` for more info.

> [!IMPORTANT]
> From v0.9.0 onward this node requires at least nodejs v12 due to using async
> functions.

## Installation

### Node-RED Palette (Preferred)

You can install the node from the built-in [Node-RED
palette](https://nodered.org/docs/user-guide/editor/palette/manager). It is
available on the menu in the top-right corner of Node-RED, under the "Manage
Palette" option; search for tado.

### Using NPM

Run the following command in the root directory of your Node-RED install or
home directory (usually ~/.node-red) and will also install needed libraries.

``` npm install node-red-contrib-tado-client ```

## Getting Started

> [!TIP] The example in `examples/tado.json` shows you how to complete device
> authentication and how to persist the refresh token between restarts of
> NoedRed

> [!TIP]
> From v0.12.0 onwards TadoX support is available as a separate node

### Install the Example Flow

There is an example flow available in the repo. I'd recommend giving it a go to
trial the functionality available. [Link to
example](https://github.com/mattdavis90/node-red-contrib-tado-client/blob/master/examples/tado.json)

[Link to Node-RED documenation on
import/export](https://nodered.org/docs/user-guide/editor/workspace/import-export)

The example can be installed from the Node-RED menu in the top-right, then
choose "Import", and paste the JSON from the example into the box. It is a good
idea to change the target to "New Flow" so you don't override any of your
existing nodes. Once imported make sure to deploy the changes.


### Find your home_id

In order to use most API calls you'll need to know your Tado `home_id`. This
can be found using the first example (`getMe`) from the example flow. Make sure
you've done the previous step and click the inject button to the left of the
`getMe` node. You should see your `home_id` in the debug message pane on the
righthand side. You can now edit other Tado nodes to include this `home_id`
value.

### Going further

You can create multiple Tado nodes, each of which interacts with a single
end-point on the Tado API. Many are demoed in the example.

The node is triggered by each message on the input, regardless of content. This
allows creating flows using other nodes to trigger the API. If the message on
the input contains any of the following fields then they will ovewrite the
properties on the node.

* Account:
  - authenticate (msg.refreshToken)
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
  - setZoneOverlay (msg.homeId, msg.zoneId, msg.power, msg.temperature,
  msg.terminationType, msg.fanSpeed, msg.acMode)

* Device:
  - getDevices (msg.homeId)
  - getDeviceTemperatureOffset (msg.deviceId)
  - identifyDevice (msg.deviceId)
  - setChildlock (msg.deviceId, msg.childlock)
  - setDeviceTemperatureOffset (msg.deviceId, msg.temperatureOffset)
  - setWindowDetection (msg.homeId, msg.zoneId, msg.windowDetection,
  msg.windowDetectionTimeout)

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
  - addEnergyIQTariff (msg.homeId, msg.unit, msg.startDate, msg.endDate,
  msg.tariffInCents)
  - updateEnergyIQTariff (msg.homeId, msg.tariffId, msg.unit, msg.startDate,
  msg.endDate, msg.tariffInCents)
  - getEnergyIQMeterReadings (msg.homeId)
  - addEnergyIQMeterReading (msg.homeId, msg.readingDate, msg.reading)
  - deleteEnergyIQMeterReading (msg.homeId)


> [!NOTE]
> For AC users - Tado changed from FanSpeed to FanLevel. If you zone shows
> FanLevel then please use Level1, Level2, etc. as the FanSpeed parameter,
> otherwise use High, Medium, Low.

The response from the Tado API is represented in ```msg.payload``` and the
generating API call is ```msg.topic```.

## Advanced Usage

It is now possible to make API calls that aren't in the list above but that
have been implemented in the underlying
[library](https://github.com/mattdavis90/node-tado-client/).

This can be done by injecting a `msg.apiCall` with the function name and a
`msg.payload` with an array of arguments.

For instance to call the `clearZoneOverlays` API as defined
[here](https://github.com/mattdavis90/node-tado-client/blob/a2ae3f3913f13ec5f754ba05eda7bda37c9e97d0/src/index.ts#L453)
but not yet exposed in Node-RED, you could do the following.

* Configure an `Inject` node with the following properties
  - `msg.apiCall` = `clearZoneOverlays`
  - `msg.payload` = `[12345, [1, 2, 3]]` - where `12345` is your home_id and
  `[1, 2, 3]` is a list of zones to clear

Other available apiCalls can be found by reading the library documenation but
some noteworthy calls are:

* [clearZoneOverlays](https://github.com/mattdavis90/node-tado-client/blob/a2ae3f3913f13ec5f754ba05eda7bda37c9e97d0/src/index.ts#L453)

* [setZoneOverlays](https://github.com/mattdavis90/node-tado-client/blob/a2ae3f3913f13ec5f754ba05eda7bda37c9e97d0/src/index.ts#L461)

* [apiCall](https://github.com/mattdavis90/node-tado-client/blob/a2ae3f3913f13ec5f754ba05eda7bda37c9e97d0/src/index.ts#L125)
  - This is the generic API call wrapper with authenticaion already handled you
  can call this method to test new API calls that even the underlying library
  doesn't yet support. If you find something useful then please open a PR or
  Issue with what you find. Thanks!

Examples of using this advanced functionality can be found in the examples
[here](https://github.com/mattdavis90/node-red-contrib-tado-client/blob/master/examples/advanced.json)

## Credits

This node is based on the work of
[SCPhillips](http://blog.scphillips.com/posts/2017/01/the-tado-api-v2/)
