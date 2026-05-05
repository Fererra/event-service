import { EventReadModel } from "./event.read-model";
import { IEventReadRepository } from "./event-read.repository.interface";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class GetEventUseCase {
  constructor(private readonly eventReadRepository: IEventReadRepository) {}

  async execute(eventId: number): Promise<EventReadModel> {
    const readModel = await this.eventReadRepository.findById(eventId);
    if (!readModel) {
      throw new NotFoundError(`Event with id ${eventId} not found`);
    }
    return readModel;
  }
}
