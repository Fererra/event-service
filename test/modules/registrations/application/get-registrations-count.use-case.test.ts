import { GetRegistrationsCountUseCase } from "../../../../src/modules/registrations/application/use-cases/get-registrations-count.use-case";
import { Registration } from "../../../../src/modules/registrations/domain/entities/registration.entity";
import { NotFoundError } from "../../../../src/shared/domain/errors/domain.error";
import {
  InMemoryRegistrationRepository,
  FakeEventInfoRepository,
  FakeTicketInfoRepository,
} from "./fakes";

describe("GetRegistrationsCountUseCase", () => {
  let useCase: GetRegistrationsCountUseCase;
  let registrationRepo: InMemoryRegistrationRepository;
  let eventRepo: FakeEventInfoRepository;
  let ticketRepo: FakeTicketInfoRepository;

  beforeEach(async () => {
    registrationRepo = new InMemoryRegistrationRepository();
    eventRepo = new FakeEventInfoRepository();
    ticketRepo = new FakeTicketInfoRepository();
    useCase = new GetRegistrationsCountUseCase(registrationRepo, ticketRepo, eventRepo);

    for (let i = 1; i <= 3; i++) {
      await registrationRepo.save(
        Registration.create({
          id: `reg-${i}`,
          userId: `user-${i}`,
          ticketId: 10,
        }),
      );
    }
  });

  it("returns count of registrations for event and ticket", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);

    const count = await useCase.execute(1, 10);

    expect(count).toBe(3);
  });

  it("throws NotFoundError when event does not exist", async () => {
    ticketRepo.setTicket(10, 1, 100);

    await expect(useCase.execute(1, 10)).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when ticket does not exist", async () => {
    eventRepo.setEvent(1);

    await expect(useCase.execute(1, 10)).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when ticket does not belong to event", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 2, 100);

    await expect(useCase.execute(1, 10)).rejects.toThrow(NotFoundError);
  });

  it("returns zero when no registrations exist", async () => {
    registrationRepo.clear();
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);

    const count = await useCase.execute(1, 10);

    expect(count).toBe(0);
  });
});
