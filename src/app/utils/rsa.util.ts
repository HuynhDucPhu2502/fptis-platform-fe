export async function importPublicKey(base64: string): Promise<CryptoKey> {
  const cleanBase64 = base64.replace(/[\s\n\r]/g, '');
  const binary = Uint8Array.from(atob(cleanBase64), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'spki',
    binary,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
}

export async function rsaEncrypt(publicKey: CryptoKey, text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded);

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
