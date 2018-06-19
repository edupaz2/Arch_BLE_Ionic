#ifndef __EPG_H__
#define __EPG_H__

#include "ble/BLE.h"

class EPG {
public:
    
    EPG();
    
    void        startServer                 ();
    
    // TODO Remove
    void        tempUpdate                  ();

private:
    
    void        init                        ();
    void        done                        ();
    
    void        onInitComplete              (BLE::InitializationCompleteCallbackContext *params);
    void        onInitError                 (BLE &ble, ble_error_t error);
    void        onConnection                (const Gap::ConnectionCallbackParams_t *params);
    void        onDisconnection             (const Gap::DisconnectionCallbackParams_t *params);

    void        onDataWritten               (const GattWriteCallbackParams *params);
    void        onDataRead                  (const GattReadCallbackParams *params);
};

#endif /* #ifndef __EPG_H__ */
