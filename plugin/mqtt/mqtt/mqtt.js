/*
 *
 *  -- MQTT plugin for Reveal.js --
 *  @Author: Rocco Musolino - hackerstribe.com
 *  Official repo: https://github.com/roccomuso/reveal.js-mqtt-plugin
 *
 */
(function() {
    var configs = Reveal.getConfig(); // getting configuration
    function hasValidParameters() {
        var outcome = true;
        var required_params = ['mqtt_broker', 'mqtt_port'];
        var self = this;
        required_params.forEach(function(i) {
            if (!configs.hasOwnProperty(i) || !configs[i]) outcome = false;
        });
        return outcome;
    }
    // check parameters
    if (!hasValidParameters()) {
        console.error('No valid parameters for MQTT in Reveal.initialize');
        return;
    }
    // Initialize MQTT client
    var client = new Paho.MQTT.Client(configs.mqtt_broker, parseInt(configs.mqtt_port), Math.random().toString(36).substring(7));
    //Gets called if the websocket/mqtt connection gets disconnected for any reason
    client.onConnectionLost = function(responseObject) {
        console.log("MQTT - connection lost: " + responseObject.errorMessage);
        updateTagsNoConnection(); // update tags with 'Connection lost'
        setTimeout(reconnect, 5 * 1000); // 5 seconds reconnect
    };
    //Gets called whenever you receive a message for your subscriptions
    client.onMessageArrived = function(message) {
        // Update the propers tags with the message received
        updateTag(message.destinationName, message.payloadString);
    };

    function onConnect() {
        // Once a connection has been made, make subscriptions and send a welcome message.
        console.log("MQTT - Connected!");
        initTags();
        var message = new Paho.MQTT.Message("Reveal.js plugin connected");
        message.destinationName = "/all";
        client.send(message);
    }

    function onFailure(message) {
        console.log('MQTT connection failed, err:', message.errorMessage)
        updateTagsNoConnection(); // update tags with 'Connection lost'
        // reconnect
        setTimeout(reconnect, 5 * 1000); // 5 seconds reconnect
    }
    // implement a reconnect logic
    function reconnect() {
        client.connect(conn_options);
    };
    // connect MQTT
    var conn_options = {
        userName: configs.mqtt_username,
        password: configs.mqtt_password,
        timeout: 5,
        onSuccess: onConnect,
        onFailure: onFailure
    };
    client.connect(conn_options);
    // subscribe options
    var subscribeOptions = {
        onSuccess: function() {
            console.log('Subscribed!');
        },
        onFailure: function(response) {
            console.error('MQTT Subscribing Error: ' + response.errorCode);
        }
    };
    // will keep topics and dom elements.
    var TOPICS = {};
    var initialized = false;

    function initTags() {
        // Subscribe to all the topics specified by tags.
        if (!initialized) {
            [].forEach.call(document.querySelectorAll('[mqtt]'), function(topic) {
                var elems = topic.getElementsByTagName('span');
                if (!elems.length) return console.log('No topic specified for this mqtt tag');
                // convert nodelist to array
                elems = Array.prototype.slice.call(elems);
                elems.forEach(function(span) {
                    // get topic name
                    var topic_name = span.innerHTML.trim();
                    // if already exists, push the dom element to the array
                    if (TOPICS.hasOwnProperty(topic_name)) {
                        TOPICS[topic_name].push(span);
                    } else {
                        // first time added, init array and push it, then subscribe the topic
                        TOPICS[topic_name] = [];
                        TOPICS[topic_name].push(span);
                    }
                });
            });
            initialized = true;
        }
        // subscribe
        if (Object.keys(TOPICS)) Object.keys(TOPICS).forEach(function(key, index) {
            // key: the name of the topic
            // index: the ordinal position of the key within the object 
            TOPICS[key].forEach(function(span) {
                if (span.hasAttribute('mqtt-qos')) subscribeOptions.qos = span.getAttribute('mqtt-qos');
                else subscribeOptions.qos = 0; // default qos
                span.innerHTML = 'connected.'; // connected and waiting for data
                client.subscribe(key, subscribeOptions);
            });
        });
    }
    // Update Tags Values
    function updateTag(topic_name, incoming_data) {
        if (!TOPICS.hasOwnProperty(topic_name)) return;
        var span_elements = TOPICS[topic_name]; // one topic could have more than one tag
        span_elements.forEach(function(span_element) {
            try {
                if (span_element.hasAttribute('json-field')) {
                    var field = span_element.getAttribute('json-field');
                    var data = JSON.parse(incoming_data);
                    if (typeof data[field] !== undefined) span_element.innerHTML = data[field]; // update using the tag-specified json field
                } else {
                    span_element.innerHTML = incoming_data; // update with the incoming content
                }
            } catch (e) {
                span_element.innerHTML = 'JSON expected';
            }
        });
    }
    // Update Tags, connection lost with the broker
    function updateTagsNoConnection() {
        // iterate over TOPICS
        if (Object.keys(TOPICS)) Object.keys(TOPICS).forEach(function(key, index) {
            // key: the name of the object key
            // index: the ordinal position of the key within the object 
            TOPICS[key].forEach(function(span) {
                span.innerHTML = 'No MQTT connection.';
            });
        });
    }
})();