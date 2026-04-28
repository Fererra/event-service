export interface VenueData {
  id: number;
  capacity: number | null;
}

export interface IVenueRepository {
  findById(id: number): Promise<VenueData | null>;
}
