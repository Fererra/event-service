import { EventFactory } from "../../domain/factories/event.factory";
import { IEventRepository } from "../../domain/repositories/event.repository.interface";
import {
  ITicketCreator,
  InlineTicketData,
} from "../../domain/repositories/ticket-creator.interface";
import { DomainError } from "../../../../shared/domain/errors/domain.error";
import { Event } from "../../domain/entities/event.entity";

export interface CreateEventCommand {
  ownerId: string;
  name: string;
  organisator: string;
  description: string;
  startTimestamp: Date;
  endTimestamp: Date;
  venueId: string;
  tickets?: InlineTicketData[];
}

export class CreateEventUseCase {
  constructor(
    private readonly eventFactory: EventFactory,
    private readonly eventRepository: IEventRepository,
    private readonly ticketCreator: ITicketCreator,
  ) {}

  async execute(command: CreateEventCommand): Promise<Event> {
    const event = await this.eventFactory.create(command);
    const savedEvent = await this.eventRepository.save(event);

    if (command.tickets && command.tickets.length > 0) {
      if (savedEvent.id === null) {
        throw new DomainError("Saved event id is missing");
      }
      await this.ticketCreator.createTicketsForEvent(savedEvent.id, command.tickets);
    }
    return savedEvent;
  }
}
