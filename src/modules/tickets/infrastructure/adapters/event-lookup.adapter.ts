import {
  EventLookupData,
  IEventLookupRepository,
} from "../../domain/repositories/event-lookup.repository.interface";
import { GetEventUseCase } from "../../../events/application/queries/get-event.use.case";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class EventLookupAdapter implements IEventLookupRepository {
  constructor(private readonly getEventUseCase: GetEventUseCase) {}

  async findById(eventId: number): Promise<EventLookupData | null> {
    try {
      const event = await this.getEventUseCase.execute(eventId);

      return {
        id: event.id,
        venueId: event.venueId,
        isCancelledOrFinished: event.isCancelledOrFinished(),
      };
    } catch (error) {
      if (error instanceof NotFoundError) return null;
      throw error;
    }
  }
}
