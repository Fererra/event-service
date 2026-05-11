import { GetEventUseCase } from "./application/queries/get-event.use-case";
import { NotFoundError } from "../../shared/domain/errors/domain.error";

export interface EventSummaryDto {
  id: number;
  name: string;
  venueId: string;
  status: string;
  ownerId: string;
}

export class EventsModule {
  constructor(private readonly getEventUseCase: GetEventUseCase) {}

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
}
