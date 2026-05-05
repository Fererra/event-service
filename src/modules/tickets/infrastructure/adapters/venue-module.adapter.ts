import { VenueData, IVenueRepository } from "../../domain/repositories/venue.repository.interface";
import { GetVenueByIdQueryHandler } from "../../../venue/application/queries/get-venue-by-id/get-venue-by-id.handler";
import { GetVenueByIdQuery } from "../../../venue/application/queries/get-venue-by-id/get-venue-by-id.query";

export class VenueModuleAdapter implements IVenueRepository {
  constructor(private readonly getVenueUseCase: GetVenueByIdQueryHandler) {}
  async findById(id: string): Promise<VenueData | null> {
    const venue = await this.getVenueUseCase.handle(new GetVenueByIdQuery(id));
    if (!venue) return null;
    return {
      id: venue.id,
      capacity: venue.capacity,
    };
  }
}
