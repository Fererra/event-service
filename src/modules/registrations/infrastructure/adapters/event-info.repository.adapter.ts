import { EventInfo, IEventInfoRepository } from "../../domain/repositories/event-info.repository";
import { EventsApi } from "../../../events/events.api";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class EventInfoRepositoryAdapter implements IEventInfoRepository {
  constructor(private readonly eventsApi: EventsApi) {}

  async findById(id: number): Promise<EventInfo | null> {
    const eventDto = await this.eventsApi.findById(id);

    if (!eventDto) return null;

    if (eventDto.id === null || eventDto.id === undefined) {
      throw new DomainError("Event id is missing");
    }

    return { id: eventDto.id, name: eventDto.name };
  }
}
