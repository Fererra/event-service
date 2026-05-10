import { EventCancelledCommandHandler } from "../../../../src/modules/notifications/application/handlers/event-cancelled.handler";
import { EventCancelledEvent } from "../../../../src/shared/domain/events/event-cancelled.event";
import { FakeNotificationService } from "./fakes";

describe("EventCancelledCommandHandler", () => {
  it("delegates to notification service with event payload", async () => {
    const notificationService = new FakeNotificationService();
    const handler = new EventCancelledCommandHandler(notificationService);

    const event = new EventCancelledEvent(10, "Tech Expo", "owner-1");

    await handler.handle(event);

    expect(notificationService.eventCancelledNotifications).toHaveLength(1);
    expect(notificationService.eventCancelledNotifications[0]).toEqual({
      eventId: 10,
      eventName: "Tech Expo",
      ownerId: "owner-1",
    });
  });
});
