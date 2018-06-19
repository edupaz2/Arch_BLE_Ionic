#ifndef __EPGSERVICE_H__
#define __EPGSERVICE_H__

#include "ble/BLE.h"
#include "mbed.h"

class EPGService {
private:
    const static uint8_t DATESSIZE = 12;// Do it multiple of 4
    const static uint8_t DOSESSIZE = DATESSIZE/sizeof(uint32_t);// Do it multiple of 4
    
    struct sEPGData_t {
        uint8_t             battery;// Value [0-100]
        uint8_t             dose;// Value [0-255] with one decimal [0.0 - 25.5]
        uint8_t             errors; // Mask b00000000 - 8 possible errors
        uint8_t             warnings; // Mask b00000000 - 8 possible masks
        uint32_t            dates[DATESSIZE];// epoch date in seconds
        uint32_t            doses[DOSESSIZE];// Value [0-255] with one decimal [0.0 - 25.5]
    };
    
public:

    /* BLE allow you transfer maximum is 20 bytes.
    In Bluetooth 4.0, BLE was introduced with a maximum payload of 33 bytes (not including Access Address and CRC fields). Each layer in the protocol stack takes its cut:
    
    2 bytes for packet header (type and length),
    4 bytes for MIC (when encryption is enabled),
    4 bytes for L2CAP header (channel ID and packet length),
    
    ATT protocol is left with 23 bytes, which is the default and minimal MTU for ATT protocol.
    With an ATT write request (or notification), 3 bytes are used by command type and attribute ID, 20 bytes are left for the attribute data.
    */
    // NOTE: The maximum length of an attribute value shall be 512 octets
    // Which is 512B = 128 int32.

    // Custom UUID 5d9377ff-4a16-403d-97d1-8c1be7eea6e2
    // Custom UUID d7b6ae30-93e8-4aa1-9d25-6b91a5c2ccd5
    #define BLE_UUID_SERVICE_BASE_UUID  {0xE2, 0xA6, 0xEE, 0xE7, 0x1B, 0x8C, 0xD1, 0x97, 0x3D, 0x40, 0x16, 0x4A, 0xFF, 0x77, 0x93, 0x5D}
    #define BLE_UUID_SERVICE_UUID       0x77FF
    #define BLE_UUID_CHAR_BASE_UUID     {0xD5, 0xCC, 0xC2, 0xA5, 0x91, 0x6B, 0x25, 0x9D, 0xA1, 0x4A, 0xE8, 0x93, 0x30, 0xAE, 0xB6, 0xD7}
    #define BLE_UUID_CHAR_UUID          0xAE30
    
    // https://www.bluetooth.com/specifications/gatt/services
    // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.glucose.xml
    // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.glucose_measurement.xml
    const static uint16_t EPG_SERVICE_UUID = BLE_UUID_SERVICE_UUID;
    const static uint16_t EPG_CHAR_UUID = BLE_UUID_CHAR_UUID;

    // Injections are multiple of 4
    //const static uint8_t DATES_LISTSIZE = 4*4;
    //const static uint8_t VALUES_LISTSIZE = DATES_LISTSIZE/sizeof(uint32_t); // 1 int32 will hold 4 values
    
    const static uint8_t LISTSIZE = 1;

    EPGService(BLE &_ble);

    void updateState();

private:
    BLE&                                    m_ble;
    GattCharacteristic*                     m_gattTable[LISTSIZE];
    sEPGData_t                              m_epgdata;
    uint8_t                                 m_insertInjectionIdx;
};

#endif /* #ifndef __EPGSERVICE_H__ */
