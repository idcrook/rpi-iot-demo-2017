

# MQTT client for Raspberry Pi

A javascript client that reads internal temperatures on a Pi and makes available using MQTT.


## Requirements

 - node.js
 - MQTT broker (server) available

## Getting started

Edit the `create-config.js` script to match your environment. It has values for broker name/WS port.

``` bash
cd client
npm install
./create-config.js
node index.js
```

If everything is working, can visit the URL (the HTTP :3000 ones) for a "real-time" graph of the Pi temperatures.

Browser must support WebSockets for it to work.  Most modern ones do.
