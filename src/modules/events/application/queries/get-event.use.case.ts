import { Event } from "../../domain/entities/event.entity";
import { IEventRepository } from "../../domain/repositories/event.repository.interface";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class GetEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(eventId: number): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with id ${eventId} not found`);
    }
    return event;
  }
}
