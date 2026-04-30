import { TicketType } from "../value-objects/ticket-type.enum";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export interface TicketProps {
  id: number;
  eventId: number;
  type: TicketType;
  limit: number;
  price: number;
}

export class Ticket {
  private readonly _id: number;
  private readonly _eventId: number;
  private readonly _type: TicketType;
  private _limit: number;
  private _price: number;

  constructor(props: TicketProps) {
    if (props.limit <= 0) {
      throw new DomainError("Ticket limit cannot be negative or zero");
    }
    if (props.price < 0) {
      throw new DomainError("Ticket price cannot be negative");
    }

    this._id = props.id;
    this._eventId = props.eventId;
    this._type = props.type;
    this._limit = props.limit;
    this._price = props.price;
  }

  get id(): number {
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
    if (newLimit <= 0) {
      throw new DomainError("Ticket limit cannot be negative or zero");
    }
    this._limit = newLimit;
  }

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new DomainError("Ticket price cannot be negative");
    }
    this._price = newPrice;
  }
}
