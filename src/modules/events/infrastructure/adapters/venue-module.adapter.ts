import { VenueData, IVenueRepository } from "../../domain/repositories/venue.repository.interface";
import { VenueApi } from "../../../venue/api/venue.api";

export class VenueModuleAdapter implements IVenueRepository {
  constructor(private readonly venueModule: VenueApi) {}
  async findById(id: string): Promise<VenueData | null> {
    const venue = await this.venueModule.getVenueById(id);
    if (!venue) return null;
    return {
      id: venue.id,
      capacity: venue.capacity,
    };
  }
}
