import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";
import { UserRole } from "../../../../shared/domain/value-objects/user-role.enum";
import { Registration } from "../../domain/entities/registration.entity";

export class GetUserRegistrationUseCase {
  constructor(private readonly registrationRepository: RegistrationRepository) {}

  async execute(id: string, userId: string, actorRole: UserRole): Promise<Registration> {
    const registration =
      actorRole === UserRole.ADMIN
        ? await this.registrationRepository.findById(id)
        : await this.registrationRepository.findByIdAndUserId(id, userId);
    if (!registration) {
      throw new NotFoundError("Registration not found");
    }
    return registration;
  }
}
