import { Event } from "../../domain/entities/event.entity";
import { IEventRepository } from "../../domain/repositories/event.repository.interface";

export class GetEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(): Promise<Event[]> {
    return this.eventRepository.findAll();
  }
}
