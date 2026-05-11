import { GetVenueByIdQueryHandler } from "../application/queries/get-venue-by-id/get-venue-by-id.handler";
import { GetVenueByIdQuery } from "../application/queries/get-venue-by-id/get-venue-by-id.query";
import { VenueApiDto } from "./dto/venue-api.dto";

export class VenueApi {
  constructor(private readonly getVenueByIdHandler: GetVenueByIdQueryHandler) {}

  async getVenueById(venueId: string): Promise<VenueApiDto | null> {
    const query = new GetVenueByIdQuery(venueId);
    const result = await this.getVenueByIdHandler.handle(query);

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      name: result.name,
      capacity: result.capacity,
      address: result.address,
    };
  }

  async venueExists(venueId: string): Promise<boolean> {
    const venue = await this.getVenueById(venueId);
    return venue !== null;
  }
}
