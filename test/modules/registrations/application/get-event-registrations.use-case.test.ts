import { GetEventRegistrationsUseCase } from "../../../../src/modules/registrations/application/use-cases/get-event-registrations.use-case";
import { Registration } from "../../../../src/modules/registrations/domain/entities/registration.entity";
import { InMemoryRegistrationRepository } from "./fakes";

describe("GetEventRegistrationsUseCase", () => {
  let useCase: GetEventRegistrationsUseCase;
  let registrationRepo: InMemoryRegistrationRepository;

  beforeEach(async () => {
    registrationRepo = new InMemoryRegistrationRepository();
    useCase = new GetEventRegistrationsUseCase(registrationRepo);

    await registrationRepo.save(
      Registration.create({
        id: "reg-1",
        userId: "user-1",
        ticketId: 10,
      }),
    );
    await registrationRepo.save(
      Registration.create({
        id: "reg-2",
        userId: "user-2",
        ticketId: 10,
      }),
    );
  });

  it("returns all registrations for event", async () => {
    const registrations = await useCase.execute(1);

    expect(registrations.length).toBeGreaterThan(0);
  });

  it("returns empty array when event has no registrations", async () => {
    registrationRepo.clear();

    const registrations = await useCase.execute(999);

    expect(registrations).toHaveLength(0);
  });
});
