export interface EventStatProps {
  id: number | null;
  eventId: number;
  eventName: string;
  totalRegistrations: number;
  cancelledAt: Date | null;
  lastActivityAt: Date;
}

export class EventStat {
  private readonly _id: number | null;
  private readonly _eventId: number;
  private _eventName: string;
  private _totalRegistrations: number;
  private _cancelledAt: Date | null;
  private _lastActivityAt: Date;

  constructor(props: EventStatProps) {
    this._id = props.id;
    this._eventId = props.eventId;
    this._eventName = props.eventName;
    this._totalRegistrations = props.totalRegistrations;
    this._cancelledAt = props.cancelledAt;
    this._lastActivityAt = props.lastActivityAt;
  }

  static create(eventId: number, eventName: string): EventStat {
    return new EventStat({
      id: null,
      eventId,
      eventName,
      totalRegistrations: 0,
      cancelledAt: null,
      lastActivityAt: new Date(),
    });
  }

  get id(): number | null {
    return this._id;
  }

  get eventId(): number {
    return this._eventId;
  }

  get eventName(): string {
    return this._eventName;
  }

  get totalRegistrations(): number {
    return this._totalRegistrations;
  }

  get cancelledAt(): Date | null {
    return this._cancelledAt;
  }

  get lastActivityAt(): Date {
    return this._lastActivityAt;
  }

  recordRegistration(occurredAt: Date): void {
    this._totalRegistrations += 1;
    this._lastActivityAt = occurredAt;
  }

  recordCancellation(cancelledAt: Date): void {
    this._cancelledAt = cancelledAt;
    this._lastActivityAt = cancelledAt;
  }
}
