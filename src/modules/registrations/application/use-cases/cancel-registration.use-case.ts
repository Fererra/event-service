import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { NotFoundError, UnauthorizedError } from "../../../../shared/domain/errors/domain.error";
import { UserRole } from "../../../../shared/domain/value-objects/user-role.enum";

export class CancelRegistrationUseCase {
  constructor(private readonly registrationRepository: RegistrationRepository) {}

  async execute(registrationId: string, actorId: string, actorRole: UserRole): Promise<void> {
    const registration = await this.registrationRepository.findById(registrationId);

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    if (!registration.canBeCancelledBy(actorId, actorRole)) {
      throw new UnauthorizedError("Forbidden: You can only cancel your own registrations");
    }

    await this.registrationRepository.delete(registrationId);
  }
}
