import {
  EventLookupData,
  IEventLookupRepository,
} from "../../domain/repositories/event-lookup.repository.interface";
import { GetEventUseCase } from "../../../events/application/queries/get-event.use-case";
import { DomainError, NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class EventLookupAdapter implements IEventLookupRepository {
  constructor(private readonly getEventUseCase: GetEventUseCase) {}

  async findById(eventId: number): Promise<EventLookupData | null> {
    try {
      const event = await this.getEventUseCase.execute(eventId);

      if (event.id === null) {
        throw new DomainError("Event id is missing");
      }

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
