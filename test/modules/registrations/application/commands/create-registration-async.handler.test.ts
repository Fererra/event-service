import { CreateRegistrationAsyncCommandHandler } from "../../../../../src/modules/registrations/application/commands/create-registration/create-registration-async.handler";
import { CreateRegistrationCommand } from "../../../../../src/modules/registrations/application/commands/create-registration/create-registration.command";
import { RegistrationFactory } from "../../../../../src/modules/registrations/domain/factories/registration.factory";
import { DomainError, NotFoundError } from "../../../../../src/shared/domain/errors/domain.error";
import { RegistrationCreatedEvent } from "../../../../../src/shared/domain/events/registration-created.event";
import { IEventBus } from "../../../../../src/shared/application/ports/event-bus.interface";
import { IntegrationEvent } from "../../../../../src/shared/domain/events/integration-event";
import {
  FakeEventInfoRepository,
  FakeTicketInfoRepository,
  InMemoryRegistrationRepository,
} from "../fakes";

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

describe("CreateRegistrationAsyncCommandHandler", () => {
  let handler: CreateRegistrationAsyncCommandHandler;
  let registrationRepo: InMemoryRegistrationRepository;
  let eventRepo: FakeEventInfoRepository;
  let ticketRepo: FakeTicketInfoRepository;
  let factory: RegistrationFactory;
  let eventBus: FakeEventBus;

  beforeEach(() => {
    registrationRepo = new InMemoryRegistrationRepository();
    eventRepo = new FakeEventInfoRepository();
    ticketRepo = new FakeTicketInfoRepository();
    factory = new RegistrationFactory(registrationRepo, ticketRepo, eventRepo);
    eventBus = new FakeEventBus();
    handler = new CreateRegistrationAsyncCommandHandler(
      registrationRepo,
      factory,
      eventRepo,
      eventBus,
    );
  });

  it("creates and saves a new registration", async () => {
    eventRepo.setEvent(1, "Event name");
    ticketRepo.setTicket(10, 1, 100);

    const command = new CreateRegistrationCommand("user-1", 1, 10);
    const registrationId = await handler.handle(command);

    expect(registrationId).toBeDefined();
    const saved = await registrationRepo.findById(registrationId);
    expect(saved).not.toBeNull();
    expect(saved?.userId).toBe("user-1");
  });

  it("publishes RegistrationCreatedEvent when event is found", async () => {
    eventRepo.setEvent(1, "Event name");
    ticketRepo.setTicket(10, 1, 100);

    const command = new CreateRegistrationCommand("user-1", 1, 10);
    const registrationId = await handler.handle(command);

    expect(eventBus.published).toHaveLength(1);
    expect(eventBus.published[0]).toBeInstanceOf(RegistrationCreatedEvent);
    expect(eventBus.published[0]).toEqual(
      expect.objectContaining({
        registrationId,
        userId: "user-1",
        eventId: 1,
        eventName: "Event name",
        ticketId: 10,
      }),
    );
  });

  it("does not publish when event info is missing", async () => {
    const eventRepoForFactory = new FakeEventInfoRepository();
    const eventRepoForHandler = new FakeEventInfoRepository();
    eventRepoForFactory.setEvent(1, "Event name");
    ticketRepo.setTicket(10, 1, 100);

    factory = new RegistrationFactory(registrationRepo, ticketRepo, eventRepoForFactory);
    handler = new CreateRegistrationAsyncCommandHandler(
      registrationRepo,
      factory,
      eventRepoForHandler,
      eventBus,
    );

    await handler.handle(new CreateRegistrationCommand("user-1", 1, 10));

    expect(eventBus.published).toHaveLength(0);
  });

  it("throws NotFoundError when event does not exist", async () => {
    ticketRepo.setTicket(10, 1, 100);
    const command = new CreateRegistrationCommand("user-1", 1, 10);

    await expect(handler.handle(command)).rejects.toThrow(NotFoundError);
  });

  it("throws DomainError when ticket is sold out", async () => {
    eventRepo.setEvent(1, "Event name");
    ticketRepo.setTicket(10, 1, 1);

    await handler.handle(new CreateRegistrationCommand("user-1", 1, 10));

    const command2 = new CreateRegistrationCommand("user-2", 1, 10);
    await expect(handler.handle(command2)).rejects.toThrow(DomainError);
  });
});
