import { Venue } from "../../../../src/modules/venue/domain/entities/venue.entity";
import { DomainError } from "../../../../src/shared/domain/errors/domain.error";

describe("Venue (Entity)", () => {
  describe("create()", () => {
    it("creates a valid venue", () => {
      const venue = Venue.create({
        id: "venue-1",
        name: "Main Hall",
        capacity: 500,
        address: "123 Main St",
      });

      expect(venue.id).toBe("venue-1");
      expect(venue.name).toBe("Main Hall");
      expect(venue.capacity).toBe(500);
      expect(venue.address).toBe("123 Main St");
    });

    it("creates venue with null capacity", () => {
      const venue = Venue.create({
        id: "venue-1",
        name: "Main Hall",
        capacity: null,
        address: "123 Main St",
      });

      expect(venue.capacity).toBeNull();
    });

    it("throws DomainError for empty name", () => {
      expect(() =>
        Venue.create({
          id: "venue-1",
          name: "",
          capacity: 500,
          address: "123 Main St",
        }),
      ).toThrow(DomainError);
    });

    it("throws DomainError for empty address", () => {
      expect(() =>
        Venue.create({
          id: "venue-1",
          name: "Main Hall",
          capacity: 500,
          address: "",
        }),
      ).toThrow(DomainError);
    });
  });

  describe("updateName()", () => {
    it("updates name successfully", () => {
      const venue = Venue.create({
        id: "venue-1",
        name: "Main Hall",
        capacity: 500,
        address: "123 Main St",
      });

      venue.updateName("New Hall");

      expect(venue.name).toBe("New Hall");
    });

    it("throws DomainError for empty name", () => {
      const venue = Venue.create({
        id: "venue-1",
        name: "Main Hall",
        capacity: 500,
        address: "123 Main St",
      });

      expect(() => venue.updateName("")).toThrow(DomainError);
    });
  });

  describe("updateAddress()", () => {
    it("updates address successfully", () => {
      const venue = Venue.create({
        id: "venue-1",
        name: "Main Hall",
        capacity: 500,
        address: "123 Main St",
      });

      venue.updateAddress("456 New Ave");

      expect(venue.address).toBe("456 New Ave");
    });

    it("throws DomainError for empty address", () => {
      const venue = Venue.create({
        id: "venue-1",
        name: "Main Hall",
        capacity: 500,
        address: "123 Main St",
      });

      expect(() => venue.updateAddress("")).toThrow(DomainError);
    });
  });

  describe("updateCapacity()", () => {
    it("updates capacity successfully", () => {
      const venue = Venue.create({
        id: "venue-1",
        name: "Main Hall",
        capacity: 500,
        address: "123 Main St",
      });

      venue.updateCapacity(1000);

      expect(venue.capacity).toBe(1000);
    });

    it("allows setting capacity to null", () => {
      const venue = Venue.create({
        id: "venue-1",
        name: "Main Hall",
        capacity: 500,
        address: "123 Main St",
      });

      venue.updateCapacity(null);

      expect(venue.capacity).toBeNull();
    });
  });
});
