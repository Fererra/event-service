import { IEventRepository } from "../../domain/repositories/event.repository.interface";

export class SyncEventStatusesUSeCase {
  constructor(private readonly eventsRepository: IEventRepository) {}

  async execute(): Promise<void> {
    const now = new Date();

    const eventsToPublish = await this.eventsRepository.findEventsToPublish(now);
    for (const event of eventsToPublish) {
      event.publish();
      await this.eventsRepository.save(event);
    }

    const eventsToFinish = await this.eventsRepository.findEventsToFinish(now);
    for (const event of eventsToFinish) {
      event.finish();
      await this.eventsRepository.save(event);
    }
  }
}
