namespace elizatools {

    // Packing into number:  ( r << 16 ) | (g << 8 ) | b
    // Sending to ws2812   ---b---g---r--->

    //% block="Set Ring LED $cv"
    //% group="TinyLED"
    //% cv.shadow="colorNumberPicker"
    export function ringDirect(cv: number) {
        let e = pins.createBuffer(24*3)

        for (let j = 0; j < 24; j++) {
            e[j * 3 + 0] = (cv >> 16) & 0xFF;
            e[j * 3 + 1] = (cv >> 8) & 0xFF;
            e[j * 3 + 3] = (cv >> 0) & 0xFF;
            //e[j * 4 + 3 ] = 0;
        }
        ws2812b.setBufferMode(DigitalPin.P8, ws2812b.BUFFER_MODE_RGB );
        ws2812b.sendBuffer(e, DigitalPin.P8 );
    }

    //% block
    //% group="Charger"
    export function checkCharger(): boolean {
        let id = i2cReadRegister8( 0x6B, 0x48 )
        // basic.showNumber( id )
        return ( id == 0x19 )
    }

    //% block
    //% group="IMU"
    export function checkIMU(): boolean {
        let id2 = i2cReadRegister8( 0x68, 0x75 )
        return (id2 == 0x4E)
    }


    //% block
    //% group="ColorSensor"
    export function checkColorSensor(): boolean {
        let id3 = i2cReadRegister8( 41, 178 )
        // basic.showNumber( id )
        return ( id3 == 68 )
    }

    let colorSensorConfigured : boolean = false;

    //% block
    //% group="ColorSensor"
    export function colorSensorReadNumber(): number {
        let r = 0;
        let b = 0;
        let g = 0;
        colorSensorConfigure();
        if (colorSensorConfigured) {
            r = i2cReadRegister16(41, 0x8 | 0x16) >> 8;
            g = i2cReadRegister16(41, 0x8 | 0x18) >> 8;
            b = i2cReadRegister16(41, 0x8 | 0x1A) >> 8;
        }
        return ( r << 16 ) | (g << 8 ) | b;
    }

    function colorSensorConfigure() {
        if ( !colorSensorConfigured && checkColorSensor() ) {
            // turn it on
            i2cWriteRegister(41, (0 + 0x80), 3)
            basic.pause(100)
            //
            i2cWriteRegister(41, (1 + 0x80), 255)
            i2cWriteRegister(41, (3 + 0x80), 255)
            i2cWriteRegister(41, (13 + 0x80), 0)
            basic.showString( "C");
            colorSensorConfigured = true;
        }
    }

    //% block="i2c read8 @ $address reg $register"
    //% group="I2C"
    export function i2cReadRegister8(address: number, register: number): number {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        return pins.i2cReadNumber(address, NumberFormat.UInt8LE, false)
    }

    //% block="i2c read16 @ $address reg $register"
    //% group="I2C"
    export function i2cReadRegister16(address: number, register: number): number {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        return pins.i2cReadNumber(address, NumberFormat.UInt16LE, false)
    }

    //% block="i2c write8 @$address reg $register v $value"
    //% group="I2C"
    export function i2cWriteRegister(address: number, register: number, value: number) {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        pins.i2cWriteNumber(address, value, NumberFormat.UInt8LE, false)
    }


    //% block
    //% group="Misc"
    export function showA0() {
        basic.showNumber(pins.analogReadPin(AnalogPin.P0))
    }

}
