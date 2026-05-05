import { VenueReadRepository } from "../../repositories/venue-read.repository";
import { GetVenueByIdQuery } from "./get-venue-by-id.query";
import { VenueDetailModel } from "./venue-detail.model";
import { NotFoundError } from "../../../../../shared/domain/errors/domain.error";

export class GetVenueByIdQueryHandler {
  constructor(private readonly readRepository: VenueReadRepository) {}

  async handle(query: GetVenueByIdQuery): Promise<VenueDetailModel> {
    const venue = await this.readRepository.findDetailById(query.id);

    if (!venue) {
      throw new NotFoundError(`Venue with id ${query.id} not found`);
    }

    return venue;
  }
}
