import { CancelEventUseCase } from "../../../../src/modules/events/application/commands/cancel-event.use-case";
import { NotificationsApi } from "../../../../src/modules/notifications/notifications.api";
import { InMemoryEventRepository } from "./in-memory.repositories";
import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";
import { FakeNotificationService } from "../../notifications/application/fakes";

describe("CancelEventUseCase", () => {
  it("cancels owned event", async () => {
    const repo = new InMemoryEventRepository();
    const notificationService = new FakeNotificationService();
    const notificationsModule = new NotificationsApi(notificationService);
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
    const uc = new CancelEventUseCase(repo, notificationsModule);
    await uc.execute({ eventId: saved.id as number, requestingUserId: "owner" });
    const after = await repo.findById(saved.id as number);
    expect(after?.status).toBe(EventStatus.CANCELLED);
    expect(notificationService.eventCancelledNotifications).toHaveLength(1);
    expect(notificationService.eventCancelledNotifications[0]).toEqual({
      eventId: saved.id as number,
      eventName: "Lily",
      ownerId: "owner",
    });
  });

  it("throws when not owner", async () => {
    const repo = new InMemoryEventRepository();
    const notificationsModule = new NotificationsApi(new FakeNotificationService());
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
    const uc = new CancelEventUseCase(repo, notificationsModule);
    await expect(
      uc.execute({ eventId: saved.id as number, requestingUserId: "other" }),
    ).rejects.toThrow();
  });
});
