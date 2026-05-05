import { VenueCapacity } from "../value-objects/venue-capacity.vo";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export interface VenueProps {
  id: string;
  name: string;
  capacity: VenueCapacity;
  address: string;
}

export interface VenueCreateProps {
  id: string;
  name: string;
  capacity: number | null;
  address: string;
}

export class Venue {
  private constructor(
    private readonly props: VenueProps,
    validate: boolean,
  ) {
    if (validate) {
      this.validateName(props.name);
      this.validateAddress(props.address);
    }
  }

  static create(props: VenueCreateProps): Venue {
    return new Venue(
      {
        id: props.id,
        name: props.name,
        capacity: VenueCapacity.create(props.capacity),
        address: props.address,
      },
      true,
    );
  }

  static fromPersistence(props: VenueCreateProps): Venue {
    return new Venue(
      {
        id: props.id,
        name: props.name,
        capacity: VenueCapacity.create(props.capacity),
        address: props.address,
      },
      false,
    );
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get capacity(): number | null {
    return this.props.capacity.getValue();
  }
  get address(): string {
    return this.props.address;
  }

  updateName(newName: string): void {
    this.validateName(newName);
    this.props.name = newName;
  }

  updateAddress(newAddress: string): void {
    this.validateAddress(newAddress);
    this.props.address = newAddress;
  }

  updateCapacity(newCapacity: number | null): void {
    this.props.capacity = VenueCapacity.create(newCapacity);
  }

  private validateName(name: string): void {
    if (!name || name.trim() === "") {
      throw new DomainError("Venue name cannot be empty");
    }
  }

  private validateAddress(address: string): void {
    if (!address || address.trim() === "") {
      throw new DomainError("Venue address cannot be empty");
    }
  }
}
