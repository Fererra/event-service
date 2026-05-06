import { CreateRegistrationCommandHandler } from "../../../../../src/modules/registrations/application/commands/create-registration/create-registration.handler";
import { CreateRegistrationCommand } from "../../../../../src/modules/registrations/application/commands/create-registration/create-registration.command";
import { RegistrationFactory } from "../../../../../src/modules/registrations/domain/factories/registration.factory";
import { DomainError, NotFoundError } from "../../../../../src/shared/domain/errors/domain.error";
import {
  InMemoryRegistrationRepository,
  FakeEventInfoRepository,
  FakeTicketInfoRepository,
} from "../fakes";

describe("CreateRegistrationCommandHandler", () => {
  let handler: CreateRegistrationCommandHandler;
  let registrationRepo: InMemoryRegistrationRepository;
  let eventRepo: FakeEventInfoRepository;
  let ticketRepo: FakeTicketInfoRepository;
  let factory: RegistrationFactory;

  beforeEach(() => {
    registrationRepo = new InMemoryRegistrationRepository();
    eventRepo = new FakeEventInfoRepository();
    ticketRepo = new FakeTicketInfoRepository();
    factory = new RegistrationFactory(registrationRepo, ticketRepo, eventRepo);
    handler = new CreateRegistrationCommandHandler(registrationRepo, factory);
  });

  it("creates and saves a new registration", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);

    const command = new CreateRegistrationCommand("user-1", 1, 10);
    const registrationId = await handler.handle(command);

    expect(registrationId).toBeDefined();
    const saved = await registrationRepo.findById(registrationId);
    expect(saved).not.toBeNull();
    expect(saved?.userId).toBe("user-1");
  });

  it("throws NotFoundError when event does not exist", async () => {
    ticketRepo.setTicket(10, 1, 100);
    const command = new CreateRegistrationCommand("user-1", 1, 10);

    await expect(handler.handle(command)).rejects.toThrow(NotFoundError);
  });

  it("throws DomainError when ticket is sold out", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 1);

    await handler.handle(new CreateRegistrationCommand("user-1", 1, 10));

    const command2 = new CreateRegistrationCommand("user-2", 1, 10);
    await expect(handler.handle(command2)).rejects.toThrow(DomainError);
  });
});
