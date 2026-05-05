import { VenueReadRepository } from "../../repositories/venue-read.repository";
import { GetVenueByIdQuery } from "./get-venue-by-id.query";
import { VenueDetailDto } from "./venue-detail.dto";
import { NotFoundError } from "../../../../../shared/domain/errors/domain.error";

export class GetVenueByIdQueryHandler {
  constructor(private readonly readRepository: VenueReadRepository) {}

  async handle(query: GetVenueByIdQuery): Promise<VenueDetailDto> {
    const venue = await this.readRepository.findDetailById(query.id);

    if (!venue) {
      throw new NotFoundError(`Venue with id ${query.id} not found`);
    }

    return venue;
  }
}
