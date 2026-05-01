import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class GetUserRegistrationUseCase {
  constructor(
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  async execute(id: string, userId: string) {
    const registration = await this.registrationRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!registration) {
      throw new DomainError("Registration not found");
    }
    return registration;
  }
}
