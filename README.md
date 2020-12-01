# Tado Web API Node with shared config

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

* deviceId
* geoTracking
* homeId
* openWindowMode
* power
* presence
* reportDate
* reportDate
* temperature
* temperatureOffset
* terminationTimeout
* terminationType
* timetableId
* windowDetection
* windowDetectionTimeout
* zoneId

The response from the Tado API is represented in ```msg.payload``` and the generating API call is ```msg.topic```.

## Credits

This node is based on the work of [SCPhillips](http://blog.scphillips.com/posts/2017/01/the-tado-api-v2/)
