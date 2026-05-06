import { RegistrationFactory } from "../../../domain/factories/registration.factory";
import { RegistrationRepository } from "../../../domain/repositories/registration.repository";
import { CreateRegistrationCommand } from "./create-registration.command";

export class CreateRegistrationCommandHandler {
  constructor(
    private readonly repository: RegistrationRepository,
    private readonly factory: RegistrationFactory,
  ) {}

  async handle(command: CreateRegistrationCommand): Promise<string> {
    const registration = await this.factory.createNew(
      command.userId,
      command.eventId,
      command.ticketId,
    );

    await this.repository.save(registration);

    return registration.id;
  }
}
