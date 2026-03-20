// 生成随机 AES-GCM 密钥（256位）
async function generateKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('jwk', key);
  return btoa(JSON.stringify(exported)); // Base64 编码便于存储
}

// 从 Base64 密钥还原 CryptoKey
async function importKey(base64Key) {
  try {
    const jwk = JSON.parse(atob(base64Key));
    return await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (e) {
    throw new Error('密钥无效');
  }
}

// 加密文本
async function encryptText(text, base64Key) {
  const key = await importKey(base64Key);
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  const buffer = new Uint8Array(iv.length + encrypted.byteLength);
  buffer.set(iv, 0);
  buffer.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...buffer));
}

// 解密文本
async function decryptText(encryptedB64, base64Key) {
  const key = await importKey(base64Key);
  const encrypted = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));
  const iv = encrypted.slice(0, 12);
  const data = encrypted.slice(12);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}