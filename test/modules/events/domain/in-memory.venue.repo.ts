import {
  IVenueRepository,
  VenueData,
} from "../../../../src/modules/events/domain/repositories/venue.repository.interface";

export class InMemoryVenueRepository implements IVenueRepository {
  private items: VenueData[];

  constructor(initial: VenueData[] = []) {
    this.items = [...initial];
  }

  async findById(id: string): Promise<VenueData | null> {
    const v = this.items.find((x) => x.id === id);
    return v ?? null;
  }

  add(v: VenueData) {
    this.items.push(v);
  }
}
