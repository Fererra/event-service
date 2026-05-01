import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { Registration } from "../../domain/entities/registration.entity";
import { RegistrationFactory } from "../../domain/factories/registration.factory";

export class CreateRegistrationUseCase {
  constructor(
    private readonly registrationRepository: RegistrationRepository,
    private readonly registrationFactory: RegistrationFactory,
  ) {}

  async execute(data: {
    userId: string;
    eventId: number;
    ticketId: number;
  }): Promise<Registration> {
    const registration = await this.registrationFactory.createNew(
      data.userId,
      data.eventId,
      data.ticketId,
    );

    await this.registrationRepository.save(registration);

    return registration;
  }
}
