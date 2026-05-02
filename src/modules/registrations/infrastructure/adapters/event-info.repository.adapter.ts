import { IEventRepository } from "../../../events/domain/repositories/event.repository.interface";
import { EventInfo, IEventInfoRepository } from "../../domain/repositories/event-info.repository";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class EventInfoRepositoryAdapter implements IEventInfoRepository {
  constructor(private readonly eventRepository: IEventRepository) {}

  async findById(id: number): Promise<EventInfo | null> {
    const event = await this.eventRepository.findById(id);
    if (!event) return null;
    if (event.id === null) {
      throw new DomainError("Event id is missing");
    }
    return { id: event.id };
  }
}
