import { User } from "../../../../src/modules/auth/domain/entities/user.entity";
import { Email } from "../../../../src/modules/auth/domain/value-objects/email.vo";
import { UserRole } from "../../../../src/shared/domain/value-objects/user-role.enum";

function makeUser(
  overrides: Partial<{
    id: string;
    email: string;
    nickname: string;
    role: UserRole;
  }> = {},
): User {
  return User.create({
    id: overrides.id ?? "user-id-1",
    email: Email.create(overrides.email ?? "user@example.com"),
    nickname: overrides.nickname ?? "johndoe",
    passwordHash: "hashed-password",
    role: overrides.role ?? UserRole.USER,
    createdAt: new Date(),
  });
}

describe("User (Entity)", () => {
  describe("equals()", () => {
    it("returns true for users with the same id", () => {
      const a = makeUser({ id: "same-id" });
      const b = makeUser({ id: "same-id", email: "other@example.com" });
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for users with different id", () => {
      const a = makeUser({ id: "id-1" });
      const b = makeUser({ id: "id-2" });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("isAdmin()", () => {
    it("returns false for USER role", () => {
      const user = makeUser({ role: UserRole.USER });
      expect(user.isAdmin()).toBe(false);
    });

    it("returns true for ADMIN role", () => {
      const user = makeUser({ role: UserRole.ADMIN });
      expect(user.isAdmin()).toBe(true);
    });
  });

  describe("properties", () => {
    it("returns correct values via getters", () => {
      const user = makeUser({
        id: "u1",
        email: "test@test.com",
        nickname: "tester",
      });
      expect(user.id).toBe("u1");
      expect(user.email.value).toBe("test@test.com");
      expect(user.nickname).toBe("tester");
    });

    it("email is normalized to lowercase when created via Email VO", () => {
      const user = makeUser({ email: "UPPER@EXAMPLE.COM" });
      expect(user.email.value).toBe("upper@example.com");
    });
  });
});
