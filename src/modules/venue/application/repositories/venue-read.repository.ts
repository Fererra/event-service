import { VenueListItemModel } from "../queries/get-all-venues/venue-list-item.model";
import { VenueDetailModel } from "../queries/get-venue-by-id/venue-detail.model";

export interface VenueReadRepository {
  findAll(): Promise<VenueListItemModel[]>;
  findDetailById(id: string): Promise<VenueDetailModel | null>;
}
