import { RefreshToken } from "../../../../src/modules/auth/domain/entities/refresh-token.entity";
import { DomainError } from "../../../../src/shared/domain/errors/domain.error";

function makeToken(
  overrides: Partial<{
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  }> = {},
): RefreshToken {
  return RefreshToken.create({
    id: overrides.id ?? "token-id-1",
    userId: overrides.userId ?? "user-id-1",
    tokenHash: overrides.tokenHash ?? "hash-abc",
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 60_000),
    createdAt: overrides.createdAt ?? new Date(),
  });
}

describe("RefreshToken (Entity)", () => {
  describe("isExpired()", () => {
    it("returns false when token is not expired yet", () => {
      const token = makeToken({ expiresAt: new Date(Date.now() + 60_000) });
      expect(token.isExpired()).toBe(false);
    });

    it("returns true when token is expired", () => {
      const token = makeToken({ expiresAt: new Date(Date.now() - 1_000) });
      expect(token.isExpired()).toBe(true);
    });
  });

  describe("isRevoked()", () => {
    it("returns false for a newly created token", () => {
      const token = makeToken();
      expect(token.isRevoked()).toBe(false);
    });

    it("returns true after revoke()", () => {
      const token = makeToken();
      token.revoke();
      expect(token.isRevoked()).toBe(true);
    });

    it("returns true when revokedAt is set on rehydrate", () => {
      const token = RefreshToken.fromPersistence({
        id: "id",
        userId: "user-id",
        tokenHash: "hash",
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
        createdAt: new Date(),
      });
      expect(token.isRevoked()).toBe(true);
    });
  });

  describe("isValid()", () => {
    it("returns true for an active, unrevoked token", () => {
      const token = makeToken();
      expect(token.isValid()).toBe(true);
    });

    it("returns false when token is revoked", () => {
      const token = makeToken();
      token.revoke();
      expect(token.isValid()).toBe(false);
    });

    it("returns false when token is expired", () => {
      const token = makeToken({ expiresAt: new Date(Date.now() - 1_000) });
      expect(token.isValid()).toBe(false);
    });

    it("returns false when token is both expired and revoked", () => {
      const token = makeToken({ expiresAt: new Date(Date.now() - 1_000) });

      token.revoke();
      expect(token.isValid()).toBe(false);
    });
  });

  describe("revoke()", () => {
    it("sets revokedAt", () => {
      const before = new Date();
      const token = makeToken();
      token.revoke();
      expect(token.revokedAt).not.toBeNull();
      expect(token.revokedAt!.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it("throws DomainError on repeated revoke()", () => {
      const token = makeToken();
      token.revoke();
      expect(() => token.revoke()).toThrow(DomainError);
      expect(() => token.revoke()).toThrow("already revoked");
    });
  });
});
