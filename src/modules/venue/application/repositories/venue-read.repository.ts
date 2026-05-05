import { VenueListItemDto } from "../queries/get-all-venues/venue-list-item.dto";
import { VenueDetailDto } from "../queries/get-venue-by-id/venue-detail.dto";

export interface VenueReadRepository {
  findAll(): Promise<VenueListItemDto[]>;
  findDetailById(id: string): Promise<VenueDetailDto | null>;
}
