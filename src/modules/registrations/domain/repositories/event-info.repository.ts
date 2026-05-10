export interface EventInfo {
  id: number;
  name: string;
}

export interface IEventInfoRepository {
  findById(id: number): Promise<EventInfo | null>;
}
