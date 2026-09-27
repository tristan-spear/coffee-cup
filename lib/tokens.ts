import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTES = 32;

export function generateEditToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashEditToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyEditToken(token: string, tokenHash: string): boolean {
  const hashed = hashEditToken(token);
  const left = Buffer.from(hashed, "utf8");
  const right = Buffer.from(tokenHash, "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function generateEventId(): string {
  return randomBytes(9).toString("base64url");
}
