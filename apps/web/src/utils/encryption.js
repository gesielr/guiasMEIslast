// src/utils/encryption.js

// Gera chave secreta a partir de uma string (use variável de ambiente!)
const getKeyMaterial = async (password) => {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
};

const getKey = async (password, salt) => {
  const keyMaterial = await getKeyMaterial(password);
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Criptografa texto
export const encryptData = async (text, password = process.env.REACT_APP_ENCRYPTION_SECRET) => {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey(password, salt);

    const enc = new TextEncoder();
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      enc.encode(text)
    );

    const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

    return btoa(String.fromCharCode(...buffer));
  } catch (error) {
    console.error('Erro ao criptografar:', error);
    throw error;
  }
};

// Descriptografa texto
export const decryptData = async (cipherText, password = process.env.REACT_APP_ENCRYPTION_SECRET) => {
  try {
    const buffer = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));

    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 28);
    const data = buffer.slice(28);

    const key = await getKey(password, salt);

    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedContent);
  } catch (error) {
    console.error('Erro ao descriptografar:', error);
    throw error;
  }
};