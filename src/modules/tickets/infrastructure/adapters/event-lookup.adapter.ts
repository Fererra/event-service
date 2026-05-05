import {
  EventLookupData,
  IEventLookupRepository,
} from "../../domain/repositories/event-lookup.repository.interface";
import { GetEventUseCase } from "../../../events/application/queries/get-event.use-case";
import { EventStatus } from "../../../events/domain/value-objects/event-status.enum";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class EventLookupAdapter implements IEventLookupRepository {
  constructor(private readonly getEventUseCase: GetEventUseCase) {}

  async findById(eventId: number): Promise<EventLookupData | null> {
    try {
      const readModel = await this.getEventUseCase.execute(eventId);

      return {
        id: readModel.id,
        venueId: readModel.venue_id,
        isCancelledOrFinished:
          readModel.status === EventStatus.CANCELLED || readModel.status === EventStatus.FINISHED,
      };
    } catch (error) {
      if (error instanceof NotFoundError) return null;
      throw error;
    }
  }
}
