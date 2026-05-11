import { ICheckVenueEventsRepository } from "./check-venue-events.repository.interface";

export class CheckVenueHasEventsUseCase {
  constructor(private readonly repo: ICheckVenueEventsRepository) {}

  async execute(venueId: string): Promise<boolean> {
    return this.repo.hasAnyEvents(venueId);
  }
}
