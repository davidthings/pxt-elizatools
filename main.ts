//% color="#FE99F8"
namespace elizatools {

    // Packing into number:  ( r << 16 ) | (g << 8 ) | b
    // Sending to ws2812   ---b---g---r--->
    // Added some text to pxt.json to disable BT 
    // this helps with console output!

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
        // ws2812b.setBufferMode(DigitalPin.P8, ws2812b.BUFFER_MODE_RGB );
        ws2812b.sendBuffer(e, DigitalPin.P8 );
    }

    export function headDirect(cv: number) {
        let f = pins.createBuffer(3 * 3)

        let rColor2 = (cv >> 16) & 0xFF;
        let gColor2 = (cv >> 8) & 0xFF;
        let bColor2 = (cv >> 0) & 0xFF;

        for (let k = 0; k < 25; k++) {
            f[k * 3 + 0] = gColor2;
            f[k * 3 + 1] = rColor2;
            f[k * 3 + 2] = bColor2;
        }

        // ws2812b.setBufferMode(DigitalPin.P16, 1)
        ws2812b.sendBuffer(f, DigitalPin.P16)

        // ws2812b.setBufferMode(DigitalPin.P16, ws2812b.BUFFER_MODE_RGB);
        // ws2812b.sendBuffer(f, DigitalPin.P16);
    }

    export function checkCharger(): boolean {
        let id = i2cReadRegister8( 0x6B, 0x48 )
        // basic.showNumber( id )
        return ( id == 0x19 )
    }

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

    // 

    let colorSensorConfigured: boolean = false;
    let colorSensorAddress: number = 0x39;
    let colorSensorEnableRegister : number = 0x80;
    let colorSensorATimeRegister  : number = 0x81;
    let colorSensorWTimeRegister  : number = 0x83;
    let colorSensorPersRegister   : number = 0x8C;
    let colorSensorAGainRegister  : number = 0x8F;
    let colorSensorIdRegister     : number = 0x92;
    let colorSensorStatusRegister : number = 0x93;
    let colorSensorRedRegister    : number = 0x96;
    let colorSensorGreenRegister  : number = 0x98;
    let colorSensorBlueRegister   : number = 0x9A;

    let colorSensorId:number = 0x90;

    //% block
    //% group="ColorSensor"
    export function checkColorSensor(): boolean {
        let id3 = i2cReadRegister8(colorSensorAddress, colorSensorIdRegister );
        // basic.showNumber( id )
        return (id3 == colorSensorId )
    }

    export function colorSensorReadId(): number {
        let id32 = i2cReadRegister8(colorSensorAddress, colorSensorIdRegister);
        // basic.showNumber( id )
        return id32;
    }

    export function colorSensorReadStatus(): number {
        let status = i2cReadRegister8(colorSensorAddress, colorSensorStatusRegister );
        // basic.showNumber( id )
        return status;
    }

    export function colorSensorReadEnable(): number {
        let status2 = i2cReadRegister8(colorSensorAddress, colorSensorEnableRegister);
        // basic.showNumber( id )
        return status2;
    }

    //% block
    //% group="ColorSensor"
    export function colorSensorRead(): number {
        let rSense:number = 0;
        let bSense:number = 0;
        let gSense:number = 0;

        colorSensorConfigure();
        
        if (colorSensorConfigured) {
            rSense = i2cReadRegister16(colorSensorAddress, colorSensorRedRegister );
            gSense = i2cReadRegister16(colorSensorAddress, colorSensorGreenRegister );
            bSense = i2cReadRegister16(colorSensorAddress, colorSensorBlueRegister);
        }


        let rColor22 = ( rSense >> 8 ) & 0xFF;
        let gColor22 = ( gSense >> 8 ) & 0xFF;
        let bColor22 = ( bSense >> 8 ) & 0xFF;

        rColor22 = Math.pow( rColor22, 2.5 );
        gColor22 = Math.pow( gColor22, 2.5 );
        bColor22 = Math.pow( bColor22, 2.5 );

        let cMax = (rColor22 > gColor22) ? rColor22 : gColor22;
        cMax = (bColor22 > cMax) ? bColor22 : cMax;

        rColor22 = 16 * rColor22 / cMax;
        gColor22 = 16 * gColor22 / cMax;
        bColor22 = 16 * bColor22 / cMax;

        // basic.showNumber( rColor >> 4 );

        return (rColor22 << 16) | (gColor22 << 8) | bColor22;
        // return (rSense << 16) | (gSense << 8) | bSense;


   // return rSense + gSense + bSense;

    }

    export function colorGetRed( color:number ): number {
        return ( color >> 16 ) & 0xFF;
    }

    export function colorGetGreen(color: number): number {
        return ( color >> 8 ) & 0xFF;
    }

    export function colorGetBlue(color: number): number {
        return ( color & 0xFF );
    }

    function colorSensorConfigure() {
        if ( !colorSensorConfigured && checkColorSensor() ) {
            // turn it on
            // Control Reg:  PON
            i2cWriteRegister(colorSensorAddress, colorSensorEnableRegister, 0x01 )

            basic.pause(100)

            // ATime  :RGB TIMING:FF 2.4ms, C0 150ms
            i2cWriteRegister(colorSensorAddress, colorSensorATimeRegister, 0xC0 )
            // Wait Time:FF 2.4ms
            i2cWriteRegister(colorSensorAddress, colorSensorWTimeRegister, 0xFF )
            // Persistance: 0x00 - IRQ every time
            i2cWriteRegister(colorSensorAddress, colorSensorPersRegister, 0 )
            // AGain: 0 - 3
            i2cWriteRegister(colorSensorAddress, colorSensorAGainRegister, 3 )

            // Control Reg:  PON AEN
            i2cWriteRegister(colorSensorAddress, colorSensorEnableRegister, 0x08 | 0x03)
            basic.pause(100)


//            basic.showString( "C");
            colorSensorConfigured = true;
        }
    }

    export function i2cReadRegister8(address: number, register: number): number {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        return pins.i2cReadNumber(address, NumberFormat.UInt8LE, false)
    }

    export function i2cReadRegister16(address: number, register: number): number {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        return pins.i2cReadNumber(address, NumberFormat.UInt16LE, false)
    }

    export function i2cWriteRegister8_8(address: number, register: number, value: number) {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        pins.i2cWriteNumber(address, value, NumberFormat.UInt8LE, false)
    }

    export function i2cWriteRegister(address: number, register: number, value: number) {
        pins.i2cWriteNumber(
            address,
            register | ( value << 8 ),
            NumberFormat.UInt16LE,
            false
        )
        // pins.i2cWriteNumber(address, value, NumberFormat.UInt8LE, false)
    }

    //% block
    //% group="Misc"
    // export function showA0() {
    //    basic.showNumber(pins.analogReadPin(AnalogPin.P0))
    // }

}
