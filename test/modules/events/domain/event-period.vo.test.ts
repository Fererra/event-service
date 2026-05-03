import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { DomainError } from "../../../../src/shared/domain/errors/domain.error";

describe("EventPeriod value object", () => {
  it("constructs with valid start < end", () => {
    const start = new Date(Date.now() + 1000);
    const end = new Date(Date.now() + 2000);
    const p = new EventPeriod(start, end);
    expect(p.startDate.getTime()).toBe(start.getTime());
    expect(p.endDate.getTime()).toBe(end.getTime());
  });

  it("throws when start >= end", () => {
    const start = new Date();
    const end = new Date(start.getTime());
    expect(() => new EventPeriod(start, end)).toThrow(DomainError);
  });

  it("periodInMinutes and isEquals", () => {
    const start = new Date(Date.now() + 1000);
    const end = new Date(Date.now() + 61_000);
    const p = new EventPeriod(start, end);
    expect(p.periodInMinutes()).toBeCloseTo(1, 0);
    const p2 = new EventPeriod(start, end);
    expect(p.isEquals(p2)).toBe(true);
  });
});
