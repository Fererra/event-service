import { RegistrationRepository } from "../../../domain/repositories/registration.repository";
import { CancelRegistrationCommand } from "./cancel-registration.command";
import { NotFoundError, DomainError } from "../../../../../shared/domain/errors/domain.error";
import { UserRole } from "../../../../../shared/domain/value-objects/user-role.enum";
import { IEventBus } from "../../../../../shared/application/ports/event-bus.interface";
import { RegistrationCancelledEvent } from "../../../../../shared/domain/events/registration-cancelled.event";

export class CancelRegistrationCommandHandler {
  constructor(
    private readonly repository: RegistrationRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(command: CancelRegistrationCommand): Promise<void> {
    const registration = await this.repository.findById(command.registrationId);

    if (!registration) {
      throw new NotFoundError(`Registration with id ${command.registrationId} not found`);
    }

    if (!registration.canBeCancelledBy(command.executorId, command.executorRole)) {
      throw new DomainError("You don't have permission to cancel this registration");
    }

    await this.repository.delete(command.registrationId);

    await this.eventBus.publish(
      new RegistrationCancelledEvent(registration.id, registration.userId, registration.ticketId),
    );
  }
}
