import { Event } from "../entities/event.entity";

export interface IEventRepository {
  findAll(): Promise<Event[]>;
  findById(id: number): Promise<Event | null>;
  save(event: Event): Promise<Event>;
  delete(id: number): Promise<void>;
}
