export interface VenueData {
  id: string;
  capacity: number | null;
}

export interface IVenueRepository {
  findById(id: string): Promise<VenueData | null>;
}
