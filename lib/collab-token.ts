import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export interface CollabTokenPayload {
  roomId: string;
  userId: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is required for collaboration tokens");
  }

  return secret;
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createCollabToken(roomId: string, userId: string): string {
  const payload: CollabTokenPayload = {
    roomId,
    userId,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyCollabToken(token: string): CollabTokenPayload | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as CollabTokenPayload;

    if (
      typeof payload.roomId !== "string" ||
      typeof payload.userId !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
