import { Email } from "../../../../src/modules/auth/domain/value-objects/email.vo";
import { DomainError } from "../../../../src/shared/domain/errors/domain.error";

describe("Email (Value Object)", () => {
  describe("create()", () => {
    it("creates a valid email", () => {
      const email = Email.create("User@Example.COM");
      expect(email.value).toBe("user@example.com");
    });

    it("normalizes to lowercase", () => {
      const email = Email.create("HELLO@DOMAIN.ORG");
      expect(email.value).toBe("hello@domain.org");
    });

    it("trims whitespace", () => {
      const email = Email.create("  user@example.com  ");
      expect(email.value).toBe("user@example.com");
    });

    it("throws DomainError when @ is missing", () => {
      expect(() => Email.create("notanemail")).toThrow(DomainError);
    });

    it("throws DomainError when domain after @ is missing", () => {
      expect(() => Email.create("user@")).toThrow(DomainError);
    });

    it("throws DomainError when domain has no dot", () => {
      expect(() => Email.create("user@domain")).toThrow(DomainError);
    });

    it("throws DomainError for empty string", () => {
      expect(() => Email.create("")).toThrow(DomainError);
    });
  });

  describe("equals()", () => {
    it("returns true for identical emails", () => {
      const a = Email.create("user@example.com");
      const b = Email.create("user@example.com");
      expect(a.equals(b)).toBe(true);
    });

    it("returns true regardless of case at creation", () => {
      const a = Email.create("User@Example.com");
      const b = Email.create("user@example.com");
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different emails", () => {
      const a = Email.create("user@example.com");
      const b = Email.create("other@example.com");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("fromPersistence()", () => {
    it("rehydrates email from DB without revalidation", () => {
      const email = Email.fromPersistence("user@example.com");
      expect(email.value).toBe("user@example.com");
    });
  });
});
