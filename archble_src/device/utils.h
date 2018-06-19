#ifndef __UTILS_H__
#define __UTILS_H__

#include "mbed.h"

extern Serial pc;
/*
class Logger {
    public:
        static Serial& Log() {
            if (pc == null) {
                pc = new Serial(USBTX, USBRX);
            }
            return *pc;
    
    private:
        static Serial* pc;
};*/

#endif /* #ifndef __UTILS_H__ */