import { CancelRegistrationCommandHandler } from "../../../../../src/modules/registrations/application/commands/cancel-registration/cancel-registration.handler";
import { CancelRegistrationCommand } from "../../../../../src/modules/registrations/application/commands/cancel-registration/cancel-registration.command";
import { Registration } from "../../../../../src/modules/registrations/domain/entities/registration.entity";
import { DomainError } from "../../../../../src/shared/domain/errors/domain.error";
import { UserRole } from "../../../../../src/shared/domain/value-objects/user-role.enum";
import { InMemoryRegistrationRepository, FakeEventBus } from "../fakes";

describe("CancelRegistrationCommandHandler", () => {
  let handler: CancelRegistrationCommandHandler;
  let registrationRepo: InMemoryRegistrationRepository;
  let eventBus: FakeEventBus;

  beforeEach(async () => {
    registrationRepo = new InMemoryRegistrationRepository();
    eventBus = new FakeEventBus();
    handler = new CancelRegistrationCommandHandler(registrationRepo, eventBus);
  });

  it("deletes registration when user cancels their own", async () => {
    const registration = Registration.create({ id: "reg-1", userId: "user-1", ticketId: 10 });
    await registrationRepo.save(registration);

    const command = new CancelRegistrationCommand("reg-1", "user-1", UserRole.USER);
    await handler.handle(command);

    const deleted = await registrationRepo.findById("reg-1");
    expect(deleted).toBeNull();
    expect(eventBus.published.length).toBeGreaterThan(0);
  });

  it("allows admin to cancel any registration", async () => {
    const registration = Registration.create({ id: "reg-1", userId: "user-1", ticketId: 10 });
    await registrationRepo.save(registration);

    const command = new CancelRegistrationCommand("reg-1", "admin-user", UserRole.ADMIN);
    await handler.handle(command);

    const deleted = await registrationRepo.findById("reg-1");
    expect(deleted).toBeNull();
  });

  it("throws DomainError when user tries to cancel others' registration", async () => {
    const registration = Registration.create({ id: "reg-1", userId: "user-1", ticketId: 10 });
    await registrationRepo.save(registration);

    const command = new CancelRegistrationCommand("reg-1", "user-2", UserRole.USER);
    await expect(handler.handle(command)).rejects.toThrow(DomainError);
    expect(eventBus.published.length).toBe(0);
  });
});
