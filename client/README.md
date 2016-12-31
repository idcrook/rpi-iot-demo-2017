

# MQTT client for Raspberry Pi

A javascript client that reads internal temperatures on a Pi and makes available using MQTT.

Also runs a webserver for displaying charts and diagrams.

## Requirements

 - node.js
 - MQTT broker (server), with WebSockets enabled

## Getting started

Edit the `create-config.js` script to match your environment. It has values for broker name/WS port.

``` bash
cd client
npm install
./create-config.js
node index.js
```

If everything is working, can visit URL ( http://example.com:3000 ) for a "real-time" graph of the Pi temperatures.

Browser must support WebSockets for it to work.  Most modern ones do.

### MQTT Topic Structure

PubSub topic structure being used in this demo

``` javascript
// Topic Structure
// =================
// iot-demo     \
// `-<clientId>  } base topic for this client
//   |          /
//   |-> connected        - 'true' or 'false'
//   `-raspi
//     |-> redled         - 'on' or 'off'
//     |-> greenled       - 'on' or 'off'
//     |-> cputemp        - degrees C
//     `-> gputemp        - degrees C
```


So Topic "`iot-demo/+/connected`" is **status** across all the clients

## Dashboard

`dashboard.html` served from the Pi uses an SVG to display a diagram of real-time information.
