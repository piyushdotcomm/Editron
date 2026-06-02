import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// The ENCRYPTION_KEY should be exactly 32 bytes long.
// If it's not set, we'll fall back to a dummy key for local development to prevent crashes,
// but in production this MUST be set.
const envKey = process.env.ENCRYPTION_KEY || "fallback_dummy_key_for_dev_only_123!";
let secretKey: Buffer;

if (Buffer.byteLength(envKey) === KEY_LENGTH) {
  secretKey = Buffer.from(envKey);
} else {
  // If it's not exactly 32 bytes, we hash it to force it to 32 bytes.
  secretKey = crypto.createHash('sha256').update(String(envKey)).digest();
}

/**
 * Encrypts a string using AES-256-GCM
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();

  // Return iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a string using AES-256-GCM
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
