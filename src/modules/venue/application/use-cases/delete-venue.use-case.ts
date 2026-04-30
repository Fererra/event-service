import { VenueRepository } from "../../domain/repositories/venue.repository";
import { VenueEventChecker } from "../ports/venue-event-checker.service";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class DeleteVenueUseCase {
  constructor(
    private readonly venueRepository: VenueRepository,
    private readonly eventChecker: VenueEventChecker,
  ) {}

  async execute(id: string): Promise<void> {
    const venue = await this.venueRepository.findById(id);

    if (!venue) {
      throw new DomainError("Venue not found");
    }

    const hasEvents = await this.eventChecker.hasAnyEvents(id);
    if (hasEvents) {
      throw new DomainError(
        "Cannot delete venue: there are events associated with it",
      );
    }

    await this.venueRepository.delete(id);
  }
}
