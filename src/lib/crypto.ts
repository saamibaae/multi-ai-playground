"use client";

// Simple client-side AES-GCM encryption with PBKDF2-derived key from a user passphrase

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const material = await crypto.subtle.importKey(
        "raw",
        textEncoder.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
        material,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
    return key;
}

export type EncryptedString = {
    v: 1; // version
    iv: string; // base64
    salt: string; // base64
    ct: string; // base64 ciphertext
};

export async function encryptString(plaintext: string, passphrase: string): Promise<EncryptedString> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);
    const data = textEncoder.encode(plaintext);
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data));
    return { v: 1, iv: bytesToBase64(iv), salt: bytesToBase64(salt), ct: bytesToBase64(encrypted) };
}

export async function decryptString(enc: EncryptedString, passphrase: string): Promise<string> {
    if (enc.v !== 1) throw new Error("Unsupported encryption format");
    const iv = base64ToBytes(enc.iv);
    const salt = base64ToBytes(enc.salt);
    const key = await deriveKey(passphrase, salt);
    const ciphertext = base64ToBytes(enc.ct);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return textDecoder.decode(decrypted);
}


