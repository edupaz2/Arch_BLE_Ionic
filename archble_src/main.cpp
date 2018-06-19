#include "device/EPG.h"
#include "mbed.h"

DigitalOut led1(LED1);
EPG myEPG;

void periodicCallback(void)
{
    led1 = !led1; /* Do blinky on LED1 while we're waiting for BLE events */
}

void update(void)
{
    myEPG.tempUpdate();
}

int main(void)
{
    led1 = 1;
    Ticker ticker;
    ticker.attach(periodicCallback, 1);
    
    Ticker ticker2;
    ticker2.attach(update, 20);

    myEPG.startServer();
}
