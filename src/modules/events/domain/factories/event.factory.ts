import { Event } from "../entities/event.entity";
import { EventStatus } from "../value-objects/event-status.enum";
import { EventPeriod } from "../value-objects/event-period.vo";
import { IVenueRepository } from "../repositories/venue.repository.interface";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export interface CreateEventData {
  ownerId: string;
  name: string;
  organisator: string;
  description: string;
  startTimestamp: Date;
  endTimestamp: Date;
  venueId: string;
}

export class EventFactory {
  constructor(private readonly venueRepository: IVenueRepository) {}

  async create(data: CreateEventData): Promise<Event> {
    const venue = await this.venueRepository.findById(data.venueId);
    if (!venue) {
      throw new NotFoundError(`Venue with id ${data.venueId} not found`);
    }

    const period = new EventPeriod(data.startTimestamp, data.endTimestamp);
    return new Event({
      id: 0,
      ownerId: data.ownerId,
      name: data.name,
      organisator: data.organisator,
      description: data.description,
      period,
      status: EventStatus.IN_PLANNING,
      venueId: data.venueId,
      createdAt: new Date(),
    });
  }
}
