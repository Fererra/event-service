import {
  EventFactory,
  CreateEventData,
} from "../../../../src/modules/events/domain/factories/event.factory";
import { InMemoryVenueRepository } from "./in-memory.venue.repo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";
import { DomainError, NotFoundError } from "../../../../src/shared/domain/errors/domain.error";

describe("EventFactory (domain unit)", () => {
  const now = Date.now();
  const baseData = (): CreateEventData => ({
    ownerId: "user-1",
    name: "Concert",
    organisator: "Org",
    description: "Descr",
    startTimestamp: new Date(now + 1000),
    endTimestamp: new Date(now + 10_000),
    venueId: "venue-1",
  });

  it("creates event when venue exists", async () => {
    const venueRepo = new InMemoryVenueRepository([{ id: "venue-1", capacity: 100 }]);
    const factory = new EventFactory(venueRepo);
    const event = await factory.create(baseData());
    expect(event.status).toBe(EventStatus.IN_PLANNING);
    expect(event.venueId).toBe("venue-1");
  });

  it("throws NotFoundError when venue missing", async () => {
    const venueRepo = new InMemoryVenueRepository([]);
    const factory = new EventFactory(venueRepo);
    await expect(factory.create(baseData())).rejects.toThrow(NotFoundError);
  });

  it("validates tickets: unknown type, duplicates, capacity overflow", async () => {
    const venueRepo = new InMemoryVenueRepository([{ id: "venue-1", capacity: 10 }]);
    const factory = new EventFactory(venueRepo);

    // too many types
    const data = {
      ...baseData(),
      tickets: [
        { type: "regular", limit: 3, price: 10 },
        { type: "vip", limit: 3, price: 20 },
        { type: "early_bird", limit: 3, price: 5 },
        { type: "extra", limit: 1, price: 1 },
      ],
    };
    await expect(factory.create(data)).rejects.toThrow(DomainError);

    // duplicate types
    const data2 = {
      ...baseData(),
      tickets: [
        { type: "regular", limit: 3, price: 10 },
        { type: "regular", limit: 2, price: 8 },
      ],
    };
    await expect(factory.create(data2)).rejects.toThrow(DomainError);

    // capacity overflow
    const data3 = {
      ...baseData(),
      tickets: [
        { type: "regular", limit: 6, price: 10 },
        { type: "vip", limit: 6, price: 20 },
      ],
    };
    await expect(factory.create(data3)).rejects.toThrow(DomainError);
  });
});
