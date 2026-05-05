import { VenueData, IVenueRepository } from "../../domain/repositories/venue.repository.interface";
import { GetVenueByIdUseCase } from "../../../venue/application/use-cases/get-venue-by-id.use-case";

export class VenueModuleAdapter implements IVenueRepository {
  constructor(private readonly getVenueUseCase: GetVenueByIdUseCase) {}
  async findById(id: string): Promise<VenueData | null> {
    const venue = await this.getVenueUseCase.execute(id);
    if (!venue) return null;
    return {
      id: venue.id,
      capacity: venue.capacity,
    };
  }
}
