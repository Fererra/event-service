import { Event } from "../entities/event.entity";

export interface IEventRepository {
  findAll(): Promise<Event[]>;
  findById(id: number): Promise<Event | null>;
  findEventsToPublish(date: Date): Promise<Event[]>;
  findEventsToFinish(date: Date): Promise<Event[]>;
  save(event: Event): Promise<Event>;
  delete(id: number): Promise<void>;
}
