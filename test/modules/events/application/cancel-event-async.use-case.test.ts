import { CancelEventAsyncUseCase } from "../../../../src/modules/events/application/commands/cancel-event-async.use-case";
import { InMemoryEventRepository } from "./in-memory.repositories";
import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";
import { EventCancelledEvent } from "../../../../src/shared/domain/events/event-cancelled.event";
import { IEventBus } from "../../../../src/shared/application/ports/event-bus.interface";
import { IntegrationEvent } from "../../../../src/shared/domain/events/integration-event";

class FakeEventBus implements IEventBus {
  public published: IntegrationEvent[] = [];

  async publish(event: IntegrationEvent): Promise<void> {
    this.published.push(event);
  }

  subscribe<T extends IntegrationEvent>(
    _eventClass: new (...args: any[]) => T,
    _handler: (event: T) => Promise<void>,
  ): void {
    // no-op for tests
  }
}

describe("CancelEventAsyncUseCase", () => {
  it("cancels owned event and publishes EventCancelledEvent", async () => {
    const repo = new InMemoryEventRepository();
    const eventBus = new FakeEventBus();
    const e = new Event({
      id: null,
      ownerId: "owner",
      name: "Lily",
      organisator: "Org",
      description: "Discr",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.IN_PLANNING,
      venueId: "v",
      createdAt: new Date(),
    });
    const saved = await repo.save(e);
    const uc = new CancelEventAsyncUseCase(repo, eventBus);

    await uc.execute({ eventId: saved.id as number, requestingUserId: "owner" });

    const after = await repo.findById(saved.id as number);
    expect(after?.status).toBe(EventStatus.CANCELLED);
    expect(eventBus.published).toHaveLength(1);
    expect(eventBus.published[0]).toBeInstanceOf(EventCancelledEvent);
    expect(eventBus.published[0]).toEqual(
      expect.objectContaining({
        eventId: saved.id as number,
        eventName: "Lily",
        ownerId: "owner",
      }),
    );
  });

  it("throws when not owner", async () => {
    const repo = new InMemoryEventRepository();
    const eventBus = new FakeEventBus();
    const e = new Event({
      id: null,
      ownerId: "owner",
      name: "Lily",
      organisator: "Org",
      description: "Discr",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.IN_PLANNING,
      venueId: "v",
      createdAt: new Date(),
    });
    const saved = await repo.save(e);
    const uc = new CancelEventAsyncUseCase(repo, eventBus);

    await expect(
      uc.execute({ eventId: saved.id as number, requestingUserId: "other" }),
    ).rejects.toThrow();
    expect(eventBus.published).toHaveLength(0);
  });
});
