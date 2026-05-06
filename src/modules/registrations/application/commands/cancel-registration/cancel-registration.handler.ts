import { RegistrationRepository } from "../../../domain/repositories/registration.repository";
import { CancelRegistrationCommand } from "./cancel-registration.command";
import { NotFoundError, DomainError } from "../../../../../shared/domain/errors/domain.error";
import { UserRole } from "../../../../../shared/domain/value-objects/user-role.enum";

export class CancelRegistrationCommandHandler {
  constructor(private readonly repository: RegistrationRepository) {}

  async handle(command: CancelRegistrationCommand): Promise<void> {
    if (command.executorRole !== UserRole.ADMIN && command.executorId !== command.targetUserId) {
      throw new DomainError("You don't have permission to cancel this registration");
    }

    const registration = await this.repository.findById(command.registrationId);

    if (!registration) {
      throw new NotFoundError(`Registration with id ${command.registrationId} not found`);
    }

    if (!registration.canBeCancelledBy(command.executorId, command.executorRole)) {
      throw new DomainError("You don't have permission to cancel this registration");
    }

    await this.repository.delete(command.registrationId);
  }
}
