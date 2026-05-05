import { GetUserRegistrationsUseCase } from "../../../../src/modules/registrations/application/use-cases/get-user-registrations.use-case";
import { Registration } from "../../../../src/modules/registrations/domain/entities/registration.entity";
import { UnauthorizedError } from "../../../../src/shared/domain/errors/domain.error";
import { UserRole } from "../../../../src/shared/domain/value-objects/user-role.enum";
import { InMemoryRegistrationRepository } from "./fakes";

describe("GetUserRegistrationsUseCase", () => {
  let useCase: GetUserRegistrationsUseCase;
  let registrationRepo: InMemoryRegistrationRepository;

  beforeEach(async () => {
    registrationRepo = new InMemoryRegistrationRepository();
    useCase = new GetUserRegistrationsUseCase(registrationRepo);

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
        userId: "user-1",
        ticketId: 11,
      }),
    );
    await registrationRepo.save(
      Registration.create({
        id: "reg-3",
        userId: "user-2",
        ticketId: 10,
      }),
    );
  });

  it("returns user registrations when user requests their own", async () => {
    const registrations = await useCase.execute("user-1", "user-1", UserRole.USER);

    expect(registrations).toHaveLength(2);
    expect(registrations.map((r) => r.id)).toContain("reg-1");
    expect(registrations.map((r) => r.id)).toContain("reg-2");
  });

  it("returns only requested user's registrations", async () => {
    const registrations = await useCase.execute("user-1", "user-1", UserRole.USER);

    expect(registrations.every((r) => r.userId === "user-1")).toBe(true);
  });

  it("allows admin to get any user's registrations", async () => {
    const registrations = await useCase.execute("user-1", "admin-user", UserRole.ADMIN);

    expect(registrations).toHaveLength(2);
  });

  it("throws UnauthorizedError when non-admin user tries to access others' registrations", async () => {
    await expect(useCase.execute("user-1", "user-2", UserRole.USER)).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("returns empty array when user has no registrations", async () => {
    const registrations = await useCase.execute("user-3", "user-3", UserRole.USER);

    expect(registrations).toHaveLength(0);
  });
});
