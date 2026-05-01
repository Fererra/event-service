import { UnauthorizedError } from "../../../../shared/domain/errors/domain.error";
import { RegistrationRepository } from "../../domain/repositories/registration.repository";

export class GetUserRegistrationsUseCase {
  constructor(
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  async execute(userId: string, actorId: string, actorRole: string) {
    if (actorRole !== "admin" && actorId !== userId) {
      throw new UnauthorizedError(
        "Forbidden: You cannot access data of another user",
      );
    }
    return this.registrationRepository.findByUserId(userId);
  }
}
