#include "EPG.h"
#include "EPGService.h"
#include "utils.h"

#define NEED_CONSOLE_OUTPUT 1 /* Set this if you need debug messages on the console;
                               * it will have an impact on code-size and power consumption. */

#if NEED_CONSOLE_OUTPUT
#define DEBUG(...) { pc.printf(__VA_ARGS__); }
#else
#define DEBUG(...) /* nothing */
#endif /* #if NEED_CONSOLE_OUTPUT */

const static char     DEVICE_NAME[] = "myEPG";
static const uint16_t uuid16_list[] = {EPGService::EPG_SERVICE_UUID};
EPGService *epgServicePtr;

void print_error(ble_error_t error, const char* msg)
{
    printf("%s: ", msg);
    switch(error) {
        case BLE_ERROR_NONE:
            printf("BLE_ERROR_NONE: No error");
            break;
        case BLE_ERROR_BUFFER_OVERFLOW:
            printf("BLE_ERROR_BUFFER_OVERFLOW: The requested action would cause a buffer overflow and has been aborted");
            break;
        case BLE_ERROR_NOT_IMPLEMENTED:
            printf("BLE_ERROR_NOT_IMPLEMENTED: Requested a feature that isn't yet implement or isn't supported by the target HW");
            break;
        case BLE_ERROR_PARAM_OUT_OF_RANGE:
            printf("BLE_ERROR_PARAM_OUT_OF_RANGE: One of the supplied parameters is outside the valid range");
            break;
        case BLE_ERROR_INVALID_PARAM:
            printf("BLE_ERROR_INVALID_PARAM: One of the supplied parameters is invalid");
            break;
        case BLE_STACK_BUSY:
            printf("BLE_STACK_BUSY: The stack is busy");
            break;
        case BLE_ERROR_INVALID_STATE:
            printf("BLE_ERROR_INVALID_STATE: Invalid state");
            break;
        case BLE_ERROR_NO_MEM:
            printf("BLE_ERROR_NO_MEM: Out of Memory");
            break;
        case BLE_ERROR_OPERATION_NOT_PERMITTED:
            printf("BLE_ERROR_OPERATION_NOT_PERMITTED");
            break;
        case BLE_ERROR_INITIALIZATION_INCOMPLETE:
            printf("BLE_ERROR_INITIALIZATION_INCOMPLETE");
            break;
        case BLE_ERROR_ALREADY_INITIALIZED:
            printf("BLE_ERROR_ALREADY_INITIALIZED");
            break;
        case BLE_ERROR_UNSPECIFIED:
            printf("BLE_ERROR_UNSPECIFIED: Unknown error");
            break;
    }
    printf("\r\n");
}

EPG::EPG()
{}

void EPG::startServer() {
    DEBUG("EPG::startServer\n\r");
    init();
}

void EPG::init() {
    DEBUG("EPG::init\n\r");
    BLE &ble = BLE::Instance();

    ble.init(this, &EPG::onInitComplete);
}

void EPG::onInitComplete(BLE::InitializationCompleteCallbackContext *params)
{
    DEBUG("EPG::onInitComplete\n\r");
    BLE&        ble   = params->ble;
    ble_error_t error = params->error;

    if (error != BLE_ERROR_NONE) {
        /* In case of error, forward the error handling to onBleInitError */
        onInitError(ble, error);
        return;
    }

    /* Ensure that it is the default instance of BLE */
    if(ble.getInstanceID() != BLE::DEFAULT_INSTANCE) {
        return;
    }
    
    ble.gap().onConnection(this, &EPG::onConnection);
    ble.gap().onDisconnection(this, &EPG::onDisconnection);

    epgServicePtr = new EPGService(ble);

    ble.onDataWritten(this, &EPG::onDataWritten);

    /* setup advertising */
    ble.gap().accumulateAdvertisingPayload(GapAdvertisingData::BREDR_NOT_SUPPORTED | GapAdvertisingData::LE_GENERAL_DISCOVERABLE);
    //ble.gap().accumulateAdvertisingPayload(GapAdvertisingData::COMPLETE_LIST_16BIT_SERVICE_IDS, (uint8_t *)uuid16_list, sizeof(uuid16_list));
    ble.gap().accumulateAdvertisingPayload(GapAdvertisingData::COMPLETE_LIST_128BIT_SERVICE_IDS, (const uint8_t *)uuid16_list, sizeof(uuid16_list));
    ble.gap().accumulateAdvertisingPayload(GapAdvertisingData::COMPLETE_LOCAL_NAME, (uint8_t *)DEVICE_NAME, sizeof(DEVICE_NAME));
    ble.gap().setAdvertisingType(GapAdvertisingParams::ADV_CONNECTABLE_UNDIRECTED);
    ble.gap().setAdvertisingInterval(1000); // 1000ms
    ble.gap().startAdvertising();// TODO do this if there is no paired device
     
    /* SpinWait for initialization to complete. This is necessary because the
     * BLE object is used in the main loop below. */
    while (ble.hasInitialized()  == false) { /* spin loop */ }
    
    while (true) {
        ble.waitForEvent();
    }
}

/**
 * This function is called when the ble initialization process has failled
 */
void EPG::onInitError(BLE &ble, ble_error_t error)
{
    DEBUG("EPG::onInitError\n\r");
    /* Initialization error handling should go here */
}

void EPG::onConnection(const Gap::ConnectionCallbackParams_t *params)
{
    DEBUG("EPG::onConnection\n\r");
}

void EPG::onDisconnection(const Gap::DisconnectionCallbackParams_t *params)
{
    DEBUG("EPG::onDisconnection\n\r");
    BLE::Instance().gap().startAdvertising();
}

void EPG::onDataWritten(const GattWriteCallbackParams *params)
{
    DEBUG("EPG::onDataWritten\n\r");
    /**
     * Set up a callback for when an attribute has its value updated by or at the
     * connected peer. For a peripheral, this callback is triggered when the local
     * GATT server has an attribute updated by a write command from the peer.
     * For a Central, this callback is triggered when a response is received for
     * a write request.
    */
    uint32_t value = 0;
    BLE::Instance().gattServer().write(params->handle, (uint8_t *)&value, sizeof(uint32_t));
}

void EPG::onDataRead(const GattReadCallbackParams *params) {
    DEBUG("EPG::onDataRead\n\r");
    /* Callback to be invoked on the peripheral when an attribute is
     * being read by a remote client. */

    //if(params->handle == iterState->getValueHandle()) {
    //    uint32_t value = 0;
    //    BLE::Instance().gattServer().read(iterState.getValueHandle(), (uint8_t *)&value, sizeof(uint32_t));
    //}
}

void EPG::tempUpdate()
{
    epgServicePtr->updateState();
}
