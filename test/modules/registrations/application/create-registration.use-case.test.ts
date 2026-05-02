import { CreateRegistrationUseCase } from "../../../../src/modules/registrations/application/use-cases/create-registration.use-case";
import { RegistrationFactory } from "../../../../src/modules/registrations/domain/factories/registration.factory";
import { DomainError, NotFoundError } from "../../../../src/shared/domain/errors/domain.error";
import {
  InMemoryRegistrationRepository,
  FakeEventInfoRepository,
  FakeTicketInfoRepository,
} from "./fakes";

describe("CreateRegistrationUseCase", () => {
  let useCase: CreateRegistrationUseCase;
  let registrationRepo: InMemoryRegistrationRepository;
  let eventRepo: FakeEventInfoRepository;
  let ticketRepo: FakeTicketInfoRepository;
  let factory: RegistrationFactory;

  beforeEach(() => {
    registrationRepo = new InMemoryRegistrationRepository();
    eventRepo = new FakeEventInfoRepository();
    ticketRepo = new FakeTicketInfoRepository();
    factory = new RegistrationFactory(registrationRepo, ticketRepo, eventRepo);
    useCase = new CreateRegistrationUseCase(registrationRepo, factory);
  });

  it("creates and saves a new registration", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);

    const registration = await useCase.execute({
      userId: "user-1",
      eventId: 1,
      ticketId: 10,
    });

    expect(registration.id).toBeDefined();
    expect(registration.userId).toBe("user-1");
    expect(registration.ticketId).toBe(10);
  });

  it("stores registration in repository", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);

    const registration = await useCase.execute({
      userId: "user-1",
      eventId: 1,
      ticketId: 10,
    });

    const saved = await registrationRepo.findById(registration.id);
    expect(saved).not.toBeNull();
    expect(saved?.userId).toBe("user-1");
  });

  it("allows multiple registrations for different users", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);

    const reg1 = await useCase.execute({
      userId: "user-1",
      eventId: 1,
      ticketId: 10,
    });

    const reg2 = await useCase.execute({
      userId: "user-2",
      eventId: 1,
      ticketId: 10,
    });

    expect(registrationRepo.getAll()).toHaveLength(2);
    expect(reg1.id).not.toBe(reg2.id);
  });

  it("throws NotFoundError when event does not exist", async () => {
    ticketRepo.setTicket(10, 1, 100);

    await expect(
      useCase.execute({
        userId: "user-1",
        eventId: 1,
        ticketId: 10,
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when ticket does not exist", async () => {
    eventRepo.setEvent(1);

    await expect(
      useCase.execute({
        userId: "user-1",
        eventId: 1,
        ticketId: 10,
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws DomainError when ticket is sold out", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 1);

    await useCase.execute({
      userId: "user-1",
      eventId: 1,
      ticketId: 10,
    });

    await expect(
      useCase.execute({
        userId: "user-2",
        eventId: 1,
        ticketId: 10,
      }),
    ).rejects.toThrow(DomainError);
  });

  it("does not save registration if factory throws", async () => {
    eventRepo.setEvent(1);

    const countBefore = registrationRepo.getAll().length;

    try {
      await useCase.execute({
        userId: "user-1",
        eventId: 1,
        ticketId: 10,
      });
    } catch {
      // Error expected
    }

    expect(registrationRepo.getAll()).toHaveLength(countBefore);
  });
});
