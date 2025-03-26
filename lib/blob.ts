import { Buffer } from 'buffer'

function base64ToUint8Array(data: string) {
    return Uint8Array.from(Buffer.from(data, 'base64'))
}

function uint8ArrayToBase64(data: Uint8Array): string {
    return Buffer.from(data).toString('base64')
}

function uint8ArrayToString(data: Uint8Array): string {
    return Buffer.from(data).toString()
}

function stringToUint8Array(data: string): Uint8Array {
    return Uint8Array.from(Buffer.from(data))
}

export { base64ToUint8Array, uint8ArrayToBase64, uint8ArrayToString, stringToUint8Array }