import { VenueCapacity } from "../value-objects/venue-capacity.vo";

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

  changeCapacity(newCapacity: number | null): void {
    this._capacity = VenueCapacity.create(newCapacity);
  }
}
