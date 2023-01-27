//% color="#FE99F8"
namespace elizatools {

    //% block="create color"
    //% blockSetVariable=color
    //% group="Color"
    export function createColor(): Color {
        return new Color();
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
        let c = new Color();
        colorSensorConfigure();
        if (colorSensorConfigured) {
            c.red = i2cReadRegister16(41, 184) >> 8;
            c.green = i2cReadRegister16(41, 186) >> 8;
            c.blue = i2cReadRegister16(41, 188) >> 8;
        }
        return c;
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
