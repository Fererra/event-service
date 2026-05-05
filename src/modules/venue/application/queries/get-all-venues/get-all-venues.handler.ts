import { VenueReadRepository } from "../../repositories/venue-read.repository";
import { GetAllVenuesQuery } from "./get-all-venues.query";
import { VenueListItemModel } from "./venue-list-item.model";

export class GetAllVenuesQueryHandler {
  constructor(private readonly readRepository: VenueReadRepository) {}

  async handle(query: GetAllVenuesQuery): Promise<VenueListItemModel[]> {
    return this.readRepository.findAll();
  }
}
