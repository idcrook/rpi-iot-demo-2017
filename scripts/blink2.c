
/** Classic Blink for two LEDs

gcc -Wall -o blink2 blink2.c -lwiringPi
sudo ./blink2
  (Ctrl-C will exit)
*/

#include <stdio.h>
#include <signal.h>
#include <wiringPi.h>

volatile sig_atomic_t flag = 0;
void signal_handler(int signal) {
  flag = signal; // set flag (SIGINT == 2)
}


int main (void)
{
  // Register signals
  signal(SIGINT, signal_handler);

  printf("Starting blink2 sequence...\n");

  wiringPiSetup () ;

  // WiringPi pins {0,2} correspond to header pins {11,13}
  pinMode (0, OUTPUT) ;
  pinMode (2, OUTPUT) ;

  while (flag == 0)
  {
    digitalWrite (0, HIGH) ; delay (500) ;
    digitalWrite (0,  LOW) ; /* delay (500) ; */
    digitalWrite (2, HIGH) ; delay (500) ;
    digitalWrite (2,  LOW) ; delay (500) ;
    delay (500);
  }

  printf("\nExiting...\n");

  // turn off pins
  digitalWrite (0,  LOW) ;
  digitalWrite (2,  LOW) ;

  // change back to INPUT mode (the power-up default)
  pinMode (0, INPUT) ;
  pinMode (2, INPUT) ;

  return 0 ;
}
