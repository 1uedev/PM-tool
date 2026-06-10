import crypto from "crypto";

// Encrypts secrets (e.g. AI API keys) before they are stored in the DB,
// so a leaked database file does not expose them. AES-256-GCM with a key
// derived from CONFIG_SECRET (falls back to NEXTAUTH_SECRET, which is
// required anyway).
//
// Format: enc:v1:<base64(iv | authTag | ciphertext)>
// Values without the prefix are treated as legacy plaintext and returned
// as-is by decryptSecret — existing rows keep working and are upgraded on
// the next save.

const PREFIX = "enc:v1:";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey() {
  const secret = process.env.CONFIG_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("CONFIG_SECRET or NEXTAUTH_SECRET must be set to encrypt stored secrets");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext) {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decryptSecret(value) {
  if (!value) return "";
  if (!value.startsWith(PREFIX)) return value; // legacy plaintext

  try {
    const raw = Buffer.from(value.slice(PREFIX.length), "base64");
    const iv = raw.subarray(0, IV_LENGTH);
    const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    // Wrong key or corrupted value — treat as unset rather than crashing
    return "";
  }
}
