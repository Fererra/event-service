import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class GetEventRegistrationUseCase {
  constructor(private readonly registrationRepo: RegistrationRepository) {}

  async execute(id: string, eventId: number) {
    const registration = await this.registrationRepo.findByIdAndEventId(id, eventId);

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    return registration;
  }
}
