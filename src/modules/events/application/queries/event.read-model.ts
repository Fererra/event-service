import { EventStatus } from "../../domain/value-objects/event-status.enum";

export interface EventReadModel {
  id: number;
  owner_id: string;
  name: string;
  organisator: string;
  description: string;
  start_timestamp: string;
  end_timestamp: string;
  status: EventStatus;
  venue_id: string;
  created_at: string;
}
