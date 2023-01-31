//% color="#FE99F8"
namespace elizatools {

    //% block="Set Tiny LED to Color $c"
    //% group="TinyLED"
    //% c.defl=color
    export function tinyLedColor( c:Color ) {
        let b = pins.createBuffer(3)
        b[ 0 ] = c.red;
        b[ 1 ] = c.green;
        b[ 2 ] = c.blue;
        ws2812b.sendBuffer(b, DigitalPin.P8);
    }

    //% block="Set Tiny LED $cv"
    //% group="TinyLED"
    //% cv.shadow="colorNumberPicker"
    export function tinyLedDirect(cv:number) {
        let b = pins.createBuffer(3)
        b[0] = (cv >> 16) & 0xFF;
        b[1] = (cv >> 8) & 0xFF;
        b[2] = (cv >> 0) & 0xFF;
        ws2812b.sendBuffer(b, DigitalPin.P8);
    }


    //% block="create color"
    //% group="Color"
    export function createColor(): Color {
        return new Color( 0, 0, 0);
    }

    //% block="create specified color $cv"
    //% cv.shadow="colorNumberPicker"
    //% group="Color"
    export function createSpecifiedColor( cv:number ): Color {
        let c = new Color( 0, 0, 0 );
        c.selectColor( cv );
        return c;
    }

    // //% block="select color $v for $color"
    // //% v.shadow="colorNumberPicker"
    // export function selectColor( c:Color, v:number) {
    //     c.selectColor( v );
    // }

    //% block
    //% group="ColorSensor"
    export function checkColorSensor(): boolean {
        let id = i2cReadRegister8( 41, 178 )
        // basic.showNumber( id )
        return ( id == 68 )
    }

    let colorSensorConfigured : boolean = false;

    //% block
    //% group="ColorSensor"
    export function colorSensorRead( ) : Color {
        let d = new Color();
        colorSensorConfigure();
        if (colorSensorConfigured) {
            d.red = i2cReadRegister16(41, 184) >> 8;
            d.green = i2cReadRegister16(41, 186) >> 8;
            d.blue = i2cReadRegister16(41, 188) >> 8;
        }
        return d;
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

//% color="#FE99F8"
class Color {

    //% blockCombine
    public red: number;
    //% blockCombine
    public green: number;
    //% blockCombine
    public blue: number;

    constructor( red:number = 0, green:number = 0, blue:number = 0 ) {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
    }


    //% block="select color $c for $this"
    //% this.defl=color
    //% c.shadow="colorNumberPicker"
    public selectColor( c:number ) {
        this.red = (c >> 16) & 0xFF;
        this.green = (c >> 8) & 0xFF;
        this.blue = (c >> 0) & 0xFF;
    }

    //% block="get color number from $this"
    //% this.defl=color
    public getColorNumber() : number {
        return ( this.red << 16 ) | ( this.green << 8 ) | ( this.blue );
    }

    //% block="show $this"
    //% this.defl=color
    //% this.shadow=variables_get
    public show() {
        basic.showString("R")
        basic.showNumber(this.red);
        basic.showString("G")
        basic.showNumber(this.green);
        basic.showString("B")
        basic.showNumber(this.blue);
    }

}
