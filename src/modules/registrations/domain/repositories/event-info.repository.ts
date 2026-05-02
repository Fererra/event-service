export interface EventInfo {
  id: number;
}

export interface IEventInfoRepository {
  findById(id: number): Promise<EventInfo | null>;
}
