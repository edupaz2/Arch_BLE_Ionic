#include "EPGService.h"

#include "utils.h"


#define NEED_CONSOLE_OUTPUT 1 /* Set this if you need debug messages on the console;
                               * it will have an impact on code-size and power consumption. */

#if NEED_CONSOLE_OUTPUT
#define DEBUG(...) { pc.printf(__VA_ARGS__); }
#else
#define DEBUG(...) /* nothing */
#endif /* #if NEED_CONSOLE_OUTPUT */

uint32_t iters = 0;

EPGService::EPGService(BLE &_ble) : m_ble(_ble), m_insertInjectionIdx(0)
{
    memset(&m_epgdata, 0, sizeof(sEPGData_t));
    
    // Status
    m_gattTable[0] = new ReadOnlyGattCharacteristic<sEPGData_t>(EPG_CHAR_UUID, &m_epgdata, GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_NOTIFY);
    GattService epgGattService(EPGService::EPG_SERVICE_UUID, m_gattTable, sizeof(m_gattTable) / sizeof(GattCharacteristic *));
    m_ble.gattServer().addService(epgGattService);
}

void EPGService::updateState() {
    // Change battery, error, warning, dose, add a date
    m_epgdata.battery = iters;
    m_epgdata.dose = iters;
    m_epgdata.errors = iters%8;//0b00000000;
    m_epgdata.warnings = iters%8;//0b00000000;
    // Add 1 date
    int32_t epochRefDate = 1513062437; // Tuesday, December 12, 2017 7:07:17 AM
    int32_t newdate = epochRefDate + (86400*iters);// 86400 1 whole day
    m_epgdata.dates[m_insertInjectionIdx] = newdate;
    uint32_t doseIdx = m_insertInjectionIdx/sizeof(uint32_t);
    //uint8_t doseByteIdx = ((sizeof(uint32_t)-1) - (m_insertInjectionIdx % sizeof(uint32_t))) * 8; // insert from MSB to LSB
    uint8_t doseByteIdx = (m_insertInjectionIdx % sizeof(uint32_t)) * 8; // insert from LSB to MSB (same as transmission)
    m_epgdata.doses[doseIdx] = (m_epgdata.doses[doseIdx] & (~(0x000000FF<<doseByteIdx))) + ((10+iters)<<doseByteIdx);
    DEBUG("EPGService::updateState - dateIdx: %i, date:%08X\n\r", m_insertInjectionIdx, newdate);
    DEBUG("EPGService::updateState - doseIdx:%i, doseBIdx:%i, dose:%08X (%i)\n\r", doseIdx, doseByteIdx, m_epgdata.doses[doseIdx], m_epgdata.doses[doseIdx]);
    m_insertInjectionIdx = ++m_insertInjectionIdx % DATESSIZE;
    // Update
    m_ble.gattServer().write(m_gattTable[0]->getValueHandle(), (uint8_t *)&m_epgdata, sizeof(m_epgdata));
    DEBUG("EPGService::updateState - %i CHAR: %04X(%i)\n\r---\n\r", sizeof(m_epgdata), m_gattTable[0]->getValueHandle(), newdate);
    ++iters;
    
    /*iters += DATES_LISTSIZE;
    int32_t epochRefDate = 1513062437; // Tuesday, December 12, 2017 7:07:17 AM
    // 86400 1 whole day
    for(int32_t i=0; i<DATES_LISTSIZE; ++i)
    {
        int32_t newdate = epochRefDate + (86400*iters)+(86400*i);
        DEBUG("EPGService::updateState - CHAR: %04X(%i)\n\r", gattTable[i]->getValueHandle(), newdate);
        ble.gattServer().write(gattTable[1+i]->getValueHandle(), (uint8_t *)&newdate, sizeof(int32_t));
        //gattTable[i] = new ReadOnlyGattCharacteristic<uint32_t>(EPG_GLUCOSE_MEASUREMENT_CHARACTERISTIC_UUID+i, &i, GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_NOTIFY);
    }*/
}