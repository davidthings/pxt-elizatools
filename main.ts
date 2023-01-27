//% color="#FD581F"
namespace elizatools {

    //% block
    export function showA0() {
        basic.showNumber(pins.analogReadPin(AnalogPin.P0))
    }

    //% block
    export function ColorSensorId(): number {
        pins.i2cWriteNumber(
            41,
            178,
            NumberFormat.UInt8LE,
            true
        )
        return pins.i2cReadNumber(41, NumberFormat.UInt8LE, false)
    }

    //% block="i2c read8 @ $address reg $register"
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
    export function i2cWriteRegister(address: number, register: number, value: number) {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        pins.i2cWriteNumber(address, value, NumberFormat.UInt8LE, false)
    }
}
