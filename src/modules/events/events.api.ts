import { GetEventUseCase } from "./application/queries/get-event.use-case";
import { CheckVenueHasEventsUseCase } from "./application/queries/check-venue-events.use-case";
import { NotFoundError } from "../../shared/domain/errors/domain.error";

export interface EventSummaryDto {
  id: number;
  name: string;
  venueId: string;
  status: string;
  ownerId: string;
}

export class EventsApi {
  constructor(
    private readonly getEventUseCase: GetEventUseCase,
    private readonly checkVenueHasEventsUseCase: CheckVenueHasEventsUseCase,
  ) {}

  async findById(id: number): Promise<EventSummaryDto | null> {
    try {
      const readModel = await this.getEventUseCase.execute(id);
      return {
        id: readModel.id,
        name: readModel.name,
        venueId: readModel.venue_id,
        status: readModel.status,
        ownerId: readModel.owner_id,
      };
    } catch (error) {
      if (error instanceof NotFoundError) return null;
      throw error;
    }
  }

  async checkVenueHasEvents(venueId: string): Promise<boolean> {
    try {
      return await this.checkVenueHasEventsUseCase.execute(venueId);
    } catch (error) {
      throw error;
    }
  }
}
