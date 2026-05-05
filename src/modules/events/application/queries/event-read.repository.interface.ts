import { EventReadModel } from "./event.read-model";

export interface IEventReadRepository {
  findAll(): Promise<EventReadModel[]>;
  findById(id: number): Promise<EventReadModel | null>;
}
