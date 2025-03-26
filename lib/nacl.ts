import nacl from 'tweetnacl'
import scrypt from 'scrypt-async'
import {
  uint8ArrayToBase64,
  base64ToUint8Array,
  stringToUint8Array,
  uint8ArrayToString
} from './blob'

const NONCE_SK_SEPARATOR = '**'
const PASSWORD_SALT = '7376f7d53ab818f03ba381cedad3940b'

function generateNonce() {
  return nacl.randomBytes(nacl.secretbox.nonceLength)
}

function generateKeyDerivation(password: string): Promise<string> {
  return new Promise<string>((resolve) => {
    scrypt(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Argument of type 'string' is not assignable to parameter of type 'number[]'
      // it's actually typed correctly but the compiler doesn't know
      stringToUint8Array(password),
      PASSWORD_SALT,
      {
        N: 16384,
        r: 8,
        p: 1,
        dkLen: 16,
        encoding: 'hex'
      },
      (derivedKey: string) => {
        resolve(derivedKey)
      }
    )
  })
}

async function encryptSK(message: Uint8Array, key: string) {
  try {
    const password = await generateKeyDerivation(key)
    const nonce = generateNonce()
    const secretbox = nacl.secretbox(message, nonce, stringToUint8Array(password))

    if (!secretbox) throw new Error('Failed to create secretbox')

    return `${uint8ArrayToBase64(nonce)}${NONCE_SK_SEPARATOR}${uint8ArrayToBase64(secretbox)}`
  } catch (error) {
    throw new Error(`Encryption Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function decryptSK(
  sk: string,
  key: string,
  options?: { stringify?: boolean }
): Promise<string | Uint8Array> {
  try {
    const password = await generateKeyDerivation(key)
    const [nonceBase64, secretboxBase64] = sk.split(NONCE_SK_SEPARATOR)

    if (!nonceBase64 || !secretboxBase64) throw new Error('Invalid encrypted string format')

    const nonce = base64ToUint8Array(nonceBase64)
    const secretbox = base64ToUint8Array(secretboxBase64)
    const decryptedSK = nacl.secretbox.open(secretbox, nonce, stringToUint8Array(password))

    if (!decryptedSK) throw new Error('Failed to decrypt secretbox')

    return options?.stringify ? uint8ArrayToString(decryptedSK) : decryptedSK
  } catch (error) {
    throw new Error(`Decryption Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export { encryptSK, decryptSK, generateNonce }
