import { CancelRegistrationUseCase } from "../../../../src/modules/registrations/application/use-cases/cancel-registration.use-case";
import { Registration } from "../../../../src/modules/registrations/domain/entities/registration.entity";
import {
  NotFoundError,
  UnauthorizedError,
} from "../../../../src/shared/domain/errors/domain.error";
import { UserRole } from "../../../../src/shared/domain/value-objects/user-role.enum";
import { InMemoryRegistrationRepository } from "./fakes";

describe("CancelRegistrationUseCase", () => {
  let useCase: CancelRegistrationUseCase;
  let registrationRepo: InMemoryRegistrationRepository;

  beforeEach(async () => {
    registrationRepo = new InMemoryRegistrationRepository();
    useCase = new CancelRegistrationUseCase(registrationRepo);
  });

  it("deletes registration when user cancels their own", async () => {
    const registration = Registration.create({
      id: "reg-1",
      userId: "user-1",
      ticketId: 10,
    });
    await registrationRepo.save(registration);

    await useCase.execute("reg-1", "user-1", UserRole.USER);

    const deleted = await registrationRepo.findById("reg-1");
    expect(deleted).toBeNull();
  });

  it("allows admin to cancel any registration", async () => {
    const registration = Registration.create({
      id: "reg-1",
      userId: "user-1",
      ticketId: 10,
    });
    await registrationRepo.save(registration);

    await useCase.execute("reg-1", "admin-user", UserRole.ADMIN);

    const deleted = await registrationRepo.findById("reg-1");
    expect(deleted).toBeNull();
  });

  it("throws NotFoundError when registration does not exist", async () => {
    await expect(useCase.execute("nonexistent", "user-1", UserRole.USER)).rejects.toThrow(
      NotFoundError,
    );
  });

  it("throws UnauthorizedError when user tries to cancel others' registration", async () => {
    const registration = Registration.create({
      id: "reg-1",
      userId: "user-1",
      ticketId: 10,
    });
    await registrationRepo.save(registration);

    await expect(useCase.execute("reg-1", "user-2", UserRole.USER)).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("does not delete registration after failed cancel attempt", async () => {
    const registration = Registration.create({
      id: "reg-1",
      userId: "user-1",
      ticketId: 10,
    });
    await registrationRepo.save(registration);

    try {
      await useCase.execute("reg-1", "user-2", UserRole.USER);
    } catch {
      // Error expected
    }

    const stillExists = await registrationRepo.findById("reg-1");
    expect(stillExists).not.toBeNull();
  });
});
