import { EventReadModel } from "./event.read-model";
import { IEventReadRepository } from "./event-read.repository.interface";

export class GetEventsUseCase {
  constructor(private readonly eventReadRepository: IEventReadRepository) {}

  async execute(): Promise<EventReadModel[]> {
    return this.eventReadRepository.findAll();
  }
}
