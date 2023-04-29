namespace elizatools {

    // Packing into number:  ( r << 16 ) | (g << 8 ) | b
    // Sending to ws2812   ---b---g---r--->

    //% block="set ring led $cv"
    //% group="Ring"
    //% cv.shadow="colorNumberPicker"
    export function ringDirect(cv: number) {
        let e = pins.createBuffer(25*3)

        let rColor = (cv >> 16) & 0xFF;
        let gColor = (cv >>  8) & 0xFF;
        let bColor = (cv >>  0) & 0xFF;

        for (let j = 0; j < 25; j++) {
            e[j * 3 + 0] = gColor;
            e[j * 3 + 1] = rColor;
            e[j * 3 + 2] = bColor;
        }
        ws2812b.setBufferMode(DigitalPin.P8, ws2812b.BUFFER_MODE_RGB );
        ws2812b.sendBuffer(e, DigitalPin.P8 );
    }

    //% block="set head leds $cv"
    //% group="Ring"
    //% cv.shadow="colorNumberPicker"
    export function headDirect(cv: number) {
        let e = pins.createBuffer(3 * 3)

        let rColor = (cv >> 16) & 0xFF;
        let gColor = (cv >> 8) & 0xFF;
        let bColor = (cv >> 0) & 0xFF;

        for (let j = 0; j < 25; j++) {
            e[j * 3 + 0] = gColor;
            e[j * 3 + 1] = rColor;
            e[j * 3 + 2] = bColor;
        }
        ws2812b.setBufferMode(DigitalPin.P16, ws2812b.BUFFER_MODE_RGB);
        ws2812b.sendBuffer(e, DigitalPin.P16);
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
    //% group="Distance"
    export function distance(): number {
        let trig = DigitalPin.P1;
        let echo = DigitalPin.P2;
        let maxCMDistance = 100 * 58;
        
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCMDistance ); 

        return Math.idiv( d, 58 );
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
    export function colorSensorRead(): number {
        let rSense = 0;
        let bSense = 0;
        let gSense = 0;
        colorSensorConfigure();
        if (colorSensorConfigured) {
            rSense = i2cReadRegister16(0x29, 0xA0 | 0x16);
            gSense = i2cReadRegister16(0x29, 0xA0 | 0x18);
            bSense = i2cReadRegister16(0x29, 0xA0 | 0x1A);
        }
        let rColor2 = ( rSense >> 8 ) & 0xFF;
        let gColor2 = ( gSense >> 8 ) & 0xFF;
        let bColor2 = ( bSense >> 8 ) & 0xFF;

        rColor2 = Math.pow( rColor2, 2.5 );
        gColor2 = Math.pow( gColor2, 2.5 );
        bColor2 = Math.pow( bColor2, 2.5 );

        let cMax = (rColor2 > gColor2) ? rColor2 : gColor2;
        cMax = (bColor2 > cMax) ? bColor2 : cMax;

        rColor2 = 0x0F * rColor2 / cMax;
        gColor2 = 0x0F * gColor2 / cMax;
        bColor2 = 0x0F * bColor2 / cMax;

        // basic.showNumber( rColor >> 4 );

        return ( rColor2 << 16 ) | (gColor2 << 8 ) | bColor2;
    }

    function colorSensorConfigure() {
        if ( !colorSensorConfigured && checkColorSensor() ) {
            // turn it on
            // Control Reg:  PON AEN
            i2cWriteRegister(0x29, (0x00 + 0x80), 3)
            basic.pause(100)
            // RGB TIMING:FF 2.4ms, C0 150ms, 16b
            i2cWriteRegister(0x29, (0x01 + 0x80), 0xC0 )
            // Wait Time:FF 2.4ms
            i2cWriteRegister(0x29, (0x03 + 0x80), 0xFF )
            // Persistance: 0x00 - IRQ every time
            i2cWriteRegister(0x29, (0x0C + 0x80), 0)
//            basic.showString( "C");
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
