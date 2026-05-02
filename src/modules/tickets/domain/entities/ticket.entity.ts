import { TicketType } from "../value-objects/ticket-type.enum";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export interface TicketProps {
  id: number | null;
  eventId: number;
  type: TicketType;
  limit: number;
  price: number;
}

export class Ticket {
  private readonly _id: number | null;
  private readonly _eventId: number;
  private readonly _type: TicketType;
  private _limit: number;
  private _price: number;

  private constructor(props: TicketProps, validate: boolean) {
    if (validate) {
      this.validateLimit(props.limit);
      this.validatePrice(props.price);
    }

    this._id = props.id;
    this._eventId = props.eventId;
    this._type = props.type;
    this._limit = props.limit;
    this._price = props.price;
  }

  static create(props: Omit<TicketProps, "id">): Ticket {
    return new Ticket({ ...props, id: null }, true);
  }

  static fromPersistence(props: TicketProps): Ticket {
    if (props.id === null) {
      throw new DomainError("Ticket id is required for persistence");
    }
    return new Ticket(props, false);
  }

  get id(): number | null {
    return this._id;
  }

  get persistedId(): number {
    if (this._id === null) {
      throw new DomainError("Ticket id is required for persistence");
    }
    return this._id;
  }

  get eventId(): number {
    return this._eventId;
  }

  get type(): TicketType {
    return this._type;
  }

  get limit(): number {
    return this._limit;
  }

  get price(): number {
    return this._price;
  }

  updateLimit(newLimit: number): void {
    this.validateLimit(newLimit);
    this._limit = newLimit;
  }

  updatePrice(newPrice: number): void {
    this.validatePrice(newPrice);
    this._price = newPrice;
  }

  private validateLimit(limit: number): void {
    if (limit <= 0) {
      throw new DomainError("Ticket limit cannot be negative or zero");
    }
  }

  private validatePrice(price: number): void {
    if (price < 0) {
      throw new DomainError("Ticket price cannot be negative");
    }
  }
}
