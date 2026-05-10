import { IEventBus } from "../../../../../shared/application/ports/event-bus.interface";
import { RegistrationCreatedEvent } from "../../../../../shared/domain/events/registration-created.event";
import { IEventInfoRepository } from "../../../domain/repositories/event-info.repository";
import { RegistrationRepository } from "../../../domain/repositories/registration.repository";
import { RegistrationFactory } from "../../../domain/factories/registration.factory";
import { CreateRegistrationCommand } from "./create-registration.command";

export class CreateRegistrationAsyncCommandHandler {
  constructor(
    private readonly repository: RegistrationRepository,
    private readonly factory: RegistrationFactory,
    private readonly eventInfoRepository: IEventInfoRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(command: CreateRegistrationCommand): Promise<string> {
    const registration = await this.factory.createNew(
      command.userId,
      command.eventId,
      command.ticketId,
    );
    await this.repository.save(registration);

    const eventInfo = await this.eventInfoRepository.findById(command.eventId);
    if (eventInfo) {
      await this.eventBus.publish(
        new RegistrationCreatedEvent(
          registration.id,
          command.userId,
          command.eventId,
          eventInfo.name,
          command.ticketId,
        ),
      );
    }

    return registration.id;
  }
}
