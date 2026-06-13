/**
 * E2EE Cryptography Helper using the browser's native Web Crypto API.
 * 
 * Flow:
 * 1. User registers/logins -> Checks if RSA-OAEP Keypair is in localStorage.
 * 2. If none, generates one. Stores private key in localStorage, uploads public key to backend.
 * 3. Starting a chat -> Generates random 256-bit AES key. Wraps it with all participant RSA public keys.
 * 4. Sending message -> Encrypts text using AES key (AES-GCM). Sends ciphertext to backend.
 * 5. Reading message -> Unwraps conversation AES key using local private key. Decrypts ciphertext.
 */

// Helpers for encoding/decoding arrays to Base64
function arrayBufferToBase64(buffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generates an RSA-OAEP 2048-bit keypair for E2EE key wrapping.
 * Returns { publicKeyJwk, privateKeyJwk }
 */
export async function generateE2EEKeypair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['wrapKey', 'unwrapKey']
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  return { publicKeyJwk, privateKeyJwk };
}

/**
 * Imports an RSA-OAEP Public Key from its JWK representation.
 */
export async function importPublicKey(jwk) {
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['wrapKey']
  );
}

/**
 * Imports an RSA-OAEP Private Key from its JWK representation.
 */
export async function importPrivateKey(jwk) {
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['unwrapKey']
  );
}

/**
 * Generates a random AES-GCM 256-bit symmetric key for message encryption.
 */
export async function generateAESKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Wraps (encrypts) an AES key with a participant's RSA-OAEP Public Key.
 * Returns the base64-encoded encrypted key.
 */
export async function wrapAESKey(aesKey, rsaPublicKey) {
  const wrapped = await window.crypto.subtle.wrapKey(
    'raw',
    aesKey,
    rsaPublicKey,
    'RSA-OAEP'
  );
  return arrayBufferToBase64(wrapped);
}

/**
 * Unwraps (decrypts) a wrapped AES key using the local RSA-OAEP Private Key.
 * Returns the CryptoKey object.
 */
export async function unwrapAESKey(wrappedKeyBase64, rsaPrivateKey) {
  const buffer = base64ToArrayBuffer(wrappedKeyBase64);
  return await window.crypto.subtle.unwrapKey(
    'raw',
    buffer,
    rsaPrivateKey,
    'RSA-OAEP',
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plaintext using an AES-GCM key.
 * Returns a base64-encoded string formatted as "iv:ciphertext"
 */
export async function encryptText(plaintext, aesKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    aesKey,
    encoder.encode(plaintext)
  );

  const ivBase64 = arrayBufferToBase64(iv);
  const ciphertextBase64 = arrayBufferToBase64(ciphertextBuffer);

  return `${ivBase64}:${ciphertextBase64}`;
}

/**
 * Decrypts a "iv:ciphertext" formatted string using an AES-GCM key.
 * Returns the decoded plaintext.
 */
export async function decryptText(encryptedText, aesKey) {
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format.');
  }

  const iv = new Uint8Array(base64ToArrayBuffer(parts[0]));
  const ciphertext = base64ToArrayBuffer(parts[1]);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    aesKey,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
