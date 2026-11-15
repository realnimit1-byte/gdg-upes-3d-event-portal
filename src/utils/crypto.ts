/**
 * Web Crypto helpers for browser-local salted password verifiers.
 *
 * SECURITY NOTE:
 * Browser-local authentication stores salted PBKDF2 password verifiers in localStorage
 * for demonstration of the frontend workflow on a single device. Because localStorage is
 * accessible to client-side scripts on the same origin, browser-local auth is NOT equivalent
 * to server-side authentication with HTTP-only sessions and backend access control.
 */

const PBKDF2_ITERATIONS = 120_000;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function generateSaltHex(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
  }
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytesToHex(bytes);
}

export function generateUniqueId(prefix?: string): string {
  const raw =
    typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${generateSaltHex(8)}`;
  return prefix ? `${prefix}-${raw}` : raw;
}

export async function derivePasswordVerifier(password: string, saltHex: string): Promise<string> {
  if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
    throw new Error(
      'Web Crypto API (crypto.subtle) is unavailable in this browser context. Please use HTTPS or localhost.',
    );
  }

  const encoder = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  const saltBytes = hexToBytes(saltHex);
  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );

  return bytesToHex(new Uint8Array(derivedBits));
}

export async function verifyPasswordVerifier(
  password: string,
  saltHex: string,
  expectedVerifierHex: string,
): Promise<boolean> {
  if (!saltHex || !expectedVerifierHex) return false;
  const derived = await derivePasswordVerifier(password, saltHex);
  if (derived.length !== expectedVerifierHex.length) return false;

  let diff = 0;
  for (let i = 0; i < derived.length; i += 1) {
    diff |= derived.charCodeAt(i) ^ expectedVerifierHex.charCodeAt(i);
  }
  return diff === 0;
}
