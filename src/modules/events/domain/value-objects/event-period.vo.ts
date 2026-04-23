import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class EventPeriod {
  private readonly _startDate: Date;
  private readonly _endDate: Date;

  constructor(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new DomainError("Event start date must be before end date");
    }
    this._startDate = startDate;
    this._endDate = endDate;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  periodInMinutes(): number {
    return (this._endDate.getTime() - this._startDate.getTime()) / (1000 * 60);
  }

  isInPast(): boolean {
    return this._endDate < new Date();
  }

  IsEquals(other: EventPeriod): boolean {
    return (
      this._startDate.getTime() === other.startDate.getTime() &&
      this._endDate.getTime() === other.endDate.getTime()
    );
  }

  withStart(newStart: Date): EventPeriod {
    return new EventPeriod(newStart, this._endDate);
  }

  withEnd(newEnd: Date): EventPeriod {
    return new EventPeriod(this._startDate, newEnd);
  }
}
