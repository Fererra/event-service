import {
  Event,
  EventProps,
  UpdateEventData,
} from "../../../../src/modules/events/domain/entities/event.entity";
import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";
import { DomainError } from "../../../../src/shared/domain/errors/domain.error";

describe("Event entity (domain unit)", () => {
  const baseProps = (overrides?: Partial<EventProps>): EventProps => ({
    id: 1,
    ownerId: "user-1",
    name: "Concert",
    organisator: "Org",
    description: "Desc",
    period: new EventPeriod(new Date(Date.now() + 3600_000), new Date(Date.now() + 7200_000)),
    status: EventStatus.IN_PLANNING,
    venueId: "venue-1",
    createdAt: new Date(),
    ...overrides,
  });

  it("creates and exposes props", () => {
    const e = new Event(baseProps());
    expect(e.name).toBe("Concert");
    expect(e.status).toBe(EventStatus.IN_PLANNING);
    expect(e.isOwnedBy("user-1")).toBe(true);
  });

  it("cancel: transitions to CANCELLED from IN_PLANNING", () => {
    const e = new Event(baseProps());
    e.cancel();
    expect(e.status).toBe(EventStatus.CANCELLED);
  });

  it("cancel: throws when already cancelled", () => {
    const e = new Event(baseProps({ status: EventStatus.CANCELLED }));
    expect(() => e.cancel()).toThrow(DomainError);
  });

  it("publish: only from IN_PLANNING", () => {
    const e = new Event(baseProps());
    e.publish();
    expect(e.status).toBe(EventStatus.ACTIVE);
  });

  it("finish: allowed from ACTIVE or IN_PLANNING", () => {
    const e1 = new Event(baseProps({ status: EventStatus.ACTIVE }));
    e1.finish();
    expect(e1.status).toBe(EventStatus.FINISHED);

    const e2 = new Event(baseProps({ status: EventStatus.IN_PLANNING }));
    e2.finish();
    expect(e2.status).toBe(EventStatus.FINISHED);
  });

  it("delete: throws if not cancelled or finished", () => {
    const e = new Event(baseProps({ status: EventStatus.IN_PLANNING }));
    expect(() => e.delete()).toThrow(DomainError);
  });

  it("update: updates fields and period", () => {
    const e = new Event(baseProps());
    const newStart = new Date(Date.now() + 10_000_000);
    const newEnd = new Date(Date.now() + 11_000_000);
    const data: UpdateEventData = { name: "New", startTimestamp: newStart, endTimestamp: newEnd };
    e.update(data);
    expect(e.name).toBe("New");
    expect(e.startTimestamp.getTime()).toBe(newStart.getTime());
    expect(e.endTimestamp.getTime()).toBe(newEnd.getTime());
  });
});
