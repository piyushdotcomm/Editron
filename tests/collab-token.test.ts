import { describe, it, expect, beforeEach } from "vitest";

import {
  createCollabToken,
  verifyCollabToken,
} from "../lib/collab-token";

describe("collab-token", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "test-secret";
  });

  it("should create a valid token", () => {
    const token = createCollabToken("room-1", "user-1");

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("should verify a valid token", () => {
    const token = createCollabToken("room-1", "user-1");

    const payload = verifyCollabToken(token);

    expect(payload).not.toBeNull();

    expect(payload?.roomId).toBe("room-1");
    expect(payload?.userId).toBe("user-1");
  });

  it("should return null for invalid token", () => {
    const payload = verifyCollabToken("invalid-token");

    expect(payload).toBeNull();
  });

  it("should return null for tampered token", () => {
    const token = createCollabToken("room-1", "user-1");

    const tampered = token + "abc";

    const payload = verifyCollabToken(tampered);

    expect(payload).toBeNull();
  });
});