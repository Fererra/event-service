import { DeleteVenueCommandHandler } from "../../../../../src/modules/venue/application/commands/delete-venue/delete-venue.handler";
import { DeleteVenueCommand } from "../../../../../src/modules/venue/application/commands/delete-venue/delete-venue.command";
import { Venue } from "../../../../../src/modules/venue/domain/entities/venue.entity";
import { ConflictError, NotFoundError } from "../../../../../src/shared/domain/errors/domain.error";
import { InMemoryVenueRepository, FakeVenueEventChecker, FakeEventBus } from "../fakes";

describe("DeleteVenueCommandHandler", () => {
  let handler: DeleteVenueCommandHandler;
  let venueRepo: InMemoryVenueRepository;
  let eventChecker: FakeVenueEventChecker;
  let eventBus: FakeEventBus;

  beforeEach(() => {
    venueRepo = new InMemoryVenueRepository();
    eventChecker = new FakeVenueEventChecker();
    eventBus = new FakeEventBus();
    handler = new DeleteVenueCommandHandler(venueRepo, eventChecker, eventBus);
  });

  it("deletes venue successfully and publishes event", async () => {
    const venue = Venue.create({
      id: "venue-1",
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });
    await venueRepo.save(venue);

    await handler.handle(new DeleteVenueCommand("venue-1"));

    const deleted = await venueRepo.findById("venue-1");
    expect(deleted).toBeNull();

    expect(eventBus.published.length).toBe(1);
  });

  it("throws ConflictError when venue has events", async () => {
    const venue = Venue.create({
      id: "venue-1",
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });
    await venueRepo.save(venue);
    eventChecker.setHasEvents("venue-1", true);

    await expect(handler.handle(new DeleteVenueCommand("venue-1"))).rejects.toThrow(ConflictError);

    expect(eventBus.published.length).toBe(0);
  });

  it("throws NotFoundError when venue not found", async () => {
    await expect(handler.handle(new DeleteVenueCommand("nonexistent"))).rejects.toThrow(
      NotFoundError,
    );
    expect(eventBus.published.length).toBe(0);
  });
});
