import { UnauthorizedError } from "../../../../shared/domain/errors/domain.error";
import { Registration } from "../../domain/entities/registration.entity";
import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { UserRole } from "../../../../shared/domain/value-objects/user-role.enum";

export class GetUserRegistrationsUseCase {
  constructor(private readonly registrationRepository: RegistrationRepository) {}

  async execute(userId: string, actorId: string, actorRole: UserRole): Promise<Registration[]> {
    if (actorRole !== UserRole.ADMIN && actorId !== userId) {
      throw new UnauthorizedError("Forbidden: You cannot access data of another user");
    }
    return this.registrationRepository.findByUserId(userId);
  }
}
