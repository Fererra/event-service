import { RegistrationRepository } from "../../domain/repositories/registration.repository";

export class CancelRegistrationUseCase {
  constructor(
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  async execute(registrationId: string, actorId: string, actorRole: string) {
    const registration =
      await this.registrationRepository.findById(registrationId);

    if (!registration) {
      throw new Error("Registration not found");
    }

    const isOwner = registration.userId === actorId;
    const isAdmin = actorRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Forbidden: You can only cancel your own registrations");
    }

    await this.registrationRepository.delete(registrationId);
  }
}
