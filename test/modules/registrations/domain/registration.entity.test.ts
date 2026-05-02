import { Registration } from "../../../../src/modules/registrations/domain/entities/registration.entity";
import { UserRole } from "../../../../src/shared/domain/value-objects/user-role.enum";

describe("Registration (Entity)", () => {
  describe("create()", () => {
    it("creates a valid registration with generated ID and current timestamp", () => {
      const registration = Registration.create({
        id: "reg-123",
        userId: "user-1",
        ticketId: 1,
      });

      expect(registration.id).toBe("reg-123");
      expect(registration.userId).toBe("user-1");
      expect(registration.ticketId).toBe(1);
      expect(registration.registrationTimestamp).toBeInstanceOf(Date);
    });

    it("sets registration timestamp to current time", () => {
      const before = new Date();
      const registration = Registration.create({
        id: "reg-123",
        userId: "user-1",
        ticketId: 1,
      });
      const after = new Date();

      expect(registration.registrationTimestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(registration.registrationTimestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("fromProps()", () => {
    it("rehydrates registration from persisted properties", () => {
      const timestamp = new Date("2026-05-02T10:00:00Z");
      const registration = Registration.fromProps({
        id: "reg-456",
        userId: "user-2",
        ticketId: 5,
        registrationTimestamp: timestamp,
      });

      expect(registration.id).toBe("reg-456");
      expect(registration.userId).toBe("user-2");
      expect(registration.ticketId).toBe(5);
      expect(registration.registrationTimestamp).toEqual(timestamp);
    });
  });

  describe("canBeCancelledBy()", () => {
    let registration: Registration;

    beforeEach(() => {
      registration = Registration.create({
        id: "reg-123",
        userId: "user-1",
        ticketId: 1,
      });
    });

    it("allows user to cancel their own registration", () => {
      expect(registration.canBeCancelledBy("user-1", UserRole.USER)).toBe(true);
    });

    it("allows admin to cancel any registration", () => {
      expect(registration.canBeCancelledBy("different-user", UserRole.ADMIN)).toBe(true);
    });

    it("prevents user from cancelling others' registrations", () => {
      expect(registration.canBeCancelledBy("user-2", UserRole.USER)).toBe(false);
    });
  });

  describe("property getters", () => {
    it("returns all properties correctly", () => {
      const timestamp = new Date("2026-05-02T12:00:00Z");
      const registration = Registration.fromProps({
        id: "reg-789",
        userId: "user-3",
        ticketId: 10,
        registrationTimestamp: timestamp,
      });

      expect(registration.id).toBe("reg-789");
      expect(registration.userId).toBe("user-3");
      expect(registration.ticketId).toBe(10);
      expect(registration.registrationTimestamp).toEqual(timestamp);
    });
  });
});
