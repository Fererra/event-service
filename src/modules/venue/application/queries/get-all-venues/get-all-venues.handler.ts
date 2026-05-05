import { VenueReadRepository } from "../../repositories/venue-read.repository";
import { GetAllVenuesQuery } from "./get-all-venues.query";
import { VenueListItemDto } from "./venue-list-item.dto";

export class GetAllVenuesQueryHandler {
  constructor(private readonly readRepository: VenueReadRepository) {}

  async handle(query: GetAllVenuesQuery): Promise<VenueListItemDto[]> {
    return this.readRepository.findAll();
  }
}
