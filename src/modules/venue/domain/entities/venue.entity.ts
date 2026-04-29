import { VenueCapacity } from "../value-objects/venue-capacity.vo";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class Venue {
  public constructor(
    private readonly _id: string,
    private _name: string,
    private _capacity: VenueCapacity,
    private _address: string,
  ) {}

  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get capacity(): number | null {
    return this._capacity.getValue();
  }
  get address(): string {
    return this._address;
  }

  updateName(newName: string): void {
    if (!newName || newName.trim() === "") {
      throw new DomainError("Venue name cannot be empty");
    }
    this._name = newName;
  }

  updateAddress(newAddress: string): void {
    if (!newAddress || newAddress.trim() === "") {
      throw new DomainError("Venue address cannot be empty");
    }
    this._address = newAddress;
  }

  updateCapacity(newCapacity: number | null): void {
    this._capacity = VenueCapacity.create(newCapacity);
  }
}
