import { VenueCapacity } from "../../../../src/modules/venue/domain/value-objects/venue-capacity.vo";
import { DomainError } from "../../../../src/shared/domain/errors/domain.error";

describe("VenueCapacity (Value Object)", () => {
  it("creates valid capacity", () => {
    const capacity = VenueCapacity.create(500);
    expect(capacity.getValue()).toBe(500);
  });

  it("allows null capacity", () => {
    const capacity = VenueCapacity.create(null);
    expect(capacity.getValue()).toBeNull();
  });

  it("allows zero capacity", () => {
    const capacity = VenueCapacity.create(0);
    expect(capacity.getValue()).toBe(0);
  });

  it("throws DomainError for negative capacity", () => {
    expect(() => VenueCapacity.create(-10)).toThrow(DomainError);
  });
});
