async function hashSHA256(message) {
  // 1. Encode the string as a UTF-8 byte array
  const msgBuffer = new TextEncoder().encode(message);

  // 2. Hash the message (returns an ArrayBuffer)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // 3. Convert the ArrayBuffer to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}