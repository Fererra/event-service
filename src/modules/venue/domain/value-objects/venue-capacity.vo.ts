import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class VenueCapacity {
  private constructor(private readonly value: number | null) {}

  static create(capacity: number | null): VenueCapacity {
    if (capacity !== null && capacity < 0) {
      throw new DomainError("Venue capacity cannot be negative");
    }
    return new VenueCapacity(capacity);
  }

  getValue(): number | null {
    return this.value;
  }
}
