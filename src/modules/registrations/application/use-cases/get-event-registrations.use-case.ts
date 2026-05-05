import { RegistrationRepository } from "../../domain/repositories/registration.repository";

export class GetEventRegistrationsUseCase {
  constructor(private readonly registrationRepo: RegistrationRepository) {}

  async execute(eventId: number) {
    return await this.registrationRepo.findByEventId(eventId);
  }
}
