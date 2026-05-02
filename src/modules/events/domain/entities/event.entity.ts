import { DomainError } from "../../../../shared/domain/errors/domain.error";
import { EventStatus } from "../value-objects/event-status.enum";
import { EventPeriod } from "../value-objects/event-period.vo";

export interface UpdateEventData {
  name?: string;
  organisator?: string;
  description?: string;
  startTimestamp?: Date;
  endTimestamp?: Date;
  venueId?: string;
}

export interface EventProps {
  id: number | null;
  ownerId: string;
  name: string;
  organisator: string;
  description: string;
  period: EventPeriod;
  status: EventStatus;
  venueId: string;
  createdAt: Date;
}

export class Event {
  private readonly _id: number | null;
  private readonly _ownerId: string;
  private _name: string;
  private _organisator: string;
  private _description: string;
  private _period: EventPeriod;
  private _status: EventStatus;
  private _venueId: string;
  private readonly _createdAt: Date;

  constructor(props: EventProps) {
    this._id = props.id;
    this._ownerId = props.ownerId;
    this._name = props.name;
    this._organisator = props.organisator;
    this._description = props.description;
    this._period = props.period;
    this._status = props.status;
    this._venueId = props.venueId;
    this._createdAt = props.createdAt;
  }

  get id(): number | null {
    return this._id;
  }
  get ownerId(): string {
    return this._ownerId;
  }
  get name(): string {
    return this._name;
  }
  get organisator(): string {
    return this._organisator;
  }
  get description(): string {
    return this._description;
  }
  get period(): EventPeriod {
    return this._period;
  }
  get startTimestamp(): Date {
    return this._period.startDate;
  }
  get endTimestamp(): Date {
    return this._period.endDate;
  }
  get status(): EventStatus {
    return this._status;
  }
  get venueId(): string {
    return this._venueId;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  cancel(): void {
    if (this._status === EventStatus.CANCELLED) {
      throw new DomainError("Event is already cancelled");
    }
    if (this._status === EventStatus.FINISHED) {
      throw new DomainError("Cannot cancel a finished event");
    }
    this._status = EventStatus.CANCELLED;
  }

  publish(): void {
    if (this._status !== EventStatus.IN_PLANNING) {
      throw new DomainError(`Cannot publish the event that is ${this._status}`);
    }
    this._status = EventStatus.ACTIVE;
  }

  finish(): void {
    const allowedStatuses = [EventStatus.ACTIVE, EventStatus.IN_PLANNING];

    if (!allowedStatuses.includes(this._status)) {
      throw new DomainError(`Cannot finish the event that is ${this._status}`);
    }
    this._status = EventStatus.FINISHED;
  }

  update(data: UpdateEventData): void {
    if (data.startTimestamp !== undefined || data.endTimestamp !== undefined) {
      const newStart = data.startTimestamp ?? this._period.startDate;
      const newEnd = data.endTimestamp ?? this._period.endDate;
      this._period = new EventPeriod(newStart, newEnd);
    }

    if (data.name !== undefined) {
      this._name = data.name;
    }
    if (data.organisator !== undefined) {
      this._organisator = data.organisator;
    }
    if (data.description !== undefined) {
      this._description = data.description;
    }
    if (data.venueId !== undefined) {
      this._venueId = data.venueId;
    }
  }

  delete(): void {
    if (!this.isCancelledOrFinished()) {
      throw new DomainError(`Event ${this._id} cannot be deleted in its current state`);
    }
  }

  isOwnedBy(userId: string): boolean {
    return this._ownerId === userId;
  }

  isCancelledOrFinished(): boolean {
    return this._status === EventStatus.CANCELLED || this._status === EventStatus.FINISHED;
  }
}
