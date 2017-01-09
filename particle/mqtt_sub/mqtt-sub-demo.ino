// This #include statement was automatically added by the Particle IDE.
#include "MQTT.h"

// -----------------------------------
// Controlling LEDs over the Internet
// -----------------------------------

// First, let's create our "shorthand" for the pins
// Same as in the Blink an LED example:
// led1 is D0, led2 is D7

int led1 = D0;
int led2 = D7;

int count = 0;

String sensor;

byte server[] = { 192, 168, 8, 22 }; //the IP of broker
void callback(char* topic, byte* payload, unsigned int length);
MQTT client(server, 1883, callback);

char *IOT_CLIENT = ":pcore1:demo1";
char *IOT_USERNAME = "pi";
char *IOT_PASSWORD = "raspberry";

char* subTopic1 = "iot-demo/rpit5/raspi/greenled";
char* subTopic2 = "iot-demo/rpit5/raspi/redled";


void callback(char* topic, byte* payload, unsigned int length) {
    // copy payload (as a string)
    char p[length + 1];
    memcpy(p, payload, length);
    p[length] = NULL;

    String message(p);

    if (message.equals("off")) {
        digitalWrite(led1,HIGH);
        digitalWrite(led2,HIGH);
        RGB.color(0, 0, 255);
    } else if (message.equals("on")) {
        digitalWrite(led1,LOW);
        digitalWrite(led2,LOW);
        RGB.color(0, 255, 0);
    } else {
        RGB.color(255, 255, 255);
    }
    delay(200);
}

void setup() {
    /*Serial.begin( 9600 );

    while( !Serial.available() ) {
        Particle.process();
    }*/

    //
    pinMode(led1, OUTPUT);
    pinMode(led2, OUTPUT);

    // For good measure, let's also make sure both LEDs are off when we start:
    digitalWrite(led1, LOW);
    digitalWrite(led2, LOW);
    //digitalWrite(led2, HIGH);

    //
    /// pinMode(A0,INPUT);
    RGB.control(true);
    client.connect(System.deviceID(), "pi", "raspberry");
    if (client.isConnected()) {
        //Serial.println( "Connected." );
        client.subscribe(subTopic1, MQTT::EMQTT_QOS::QOS1);
    }

}

void loop() {
    if (client.isConnected()) {
        client.loop();
    }

    /* delay( 1000 );

    count = count + 1;
    if (count % 2) {
        ledToggle("on");
    } else {
        ledToggle("off");
    }

    Serial.print( "Count: " );
    Serial.println( count );*/

}


int ledToggle(String command) {
    /* Particle.functions always take a string as an argument and return an integer.
    Since we can pass a string, it means that we can give the program commands on how the function should be used.
    In this case, telling the function "on" will turn the LED on and telling it "off" will turn the LED off.
    Then, the function returns a value to us to let us know what happened.
    In this case, it will return 1 for the LEDs turning on, 0 for the LEDs turning off,
    and -1 if we received a totally bogus command that didn't do anything to the LEDs.
    */

    if (command=="on") {
        digitalWrite(led1,HIGH);
        digitalWrite(led2,HIGH);
        return 1;
    }
    else if (command=="off") {
        digitalWrite(led1,LOW);
        digitalWrite(led2,LOW);
        return 0;
    }
    else {
        return -1;
    }
}
