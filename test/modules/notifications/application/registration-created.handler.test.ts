import { RegistrationCreatedCommandHandler } from "../../../../src/modules/notifications/application/handlers/registration-created.handler";
import { RegistrationCreatedEvent } from "../../../../src/shared/domain/events/registration-created.event";
import { FakeNotificationService } from "./fakes";

describe("RegistrationCreatedCommandHandler", () => {
  it("delegates to notification service with event payload", async () => {
    const notificationService = new FakeNotificationService();
    const handler = new RegistrationCreatedCommandHandler(notificationService);

    const event = new RegistrationCreatedEvent("reg-1", "user-1", 101, "Concert", 202);

    await handler.handle(event);

    expect(notificationService.registrationConfirmations).toHaveLength(1);
    expect(notificationService.registrationConfirmations[0]).toEqual({
      registrationId: "reg-1",
      userId: "user-1",
      eventId: 101,
      eventName: "Concert",
      ticketId: 202,
    });
  });
});
