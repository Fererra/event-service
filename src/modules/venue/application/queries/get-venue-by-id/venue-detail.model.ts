export interface VenueDetailModel {
  id: string;
  name: string;
  capacity: number | null;
  address: string;
  createdAt?: Date;
}
