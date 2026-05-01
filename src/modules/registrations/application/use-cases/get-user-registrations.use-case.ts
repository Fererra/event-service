import { RegistrationRepository } from "../../domain/repositories/registration.repository";

export class GetUserRegistrationsUseCase {
  constructor(
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  async execute(userId: string) {
    return this.registrationRepository.findByUserId(userId);
  }
}
