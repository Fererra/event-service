import { UpdateVenueCommandHandler } from "../../../../../src/modules/venue/application/commands/update-venue/update-venue.handler";
import { UpdateVenueCommand } from "../../../../../src/modules/venue/application/commands/update-venue/update-venue.command";
import { Venue } from "../../../../../src/modules/venue/domain/entities/venue.entity";
import { VenueFactory } from "../../../../../src/modules/venue/domain/factories/venue.factory";
import { ConflictError, NotFoundError } from "../../../../../src/shared/domain/errors/domain.error";
import { InMemoryVenueRepository } from "../fakes";

describe("UpdateVenueCommandHandler", () => {
  let handler: UpdateVenueCommandHandler;
  let venueRepo: InMemoryVenueRepository;
  let factory: VenueFactory;

  beforeEach(() => {
    venueRepo = new InMemoryVenueRepository();
    factory = new VenueFactory(venueRepo);
    handler = new UpdateVenueCommandHandler(venueRepo, factory);
  });

  it("updates all provided fields successfully", async () => {
    const venue = Venue.create({
      id: "venue-1",
      name: "Old Hall",
      capacity: 500,
      address: "Old Address",
    });
    await venueRepo.save(venue);

    const command = new UpdateVenueCommand("venue-1", "New Hall", 1000, "New Address");
    await handler.handle(command);

    const updated = await venueRepo.findById("venue-1");
    expect(updated?.name).toBe("New Hall");
    expect(updated?.capacity).toBe(1000);
    expect(updated?.address).toBe("New Address");
  });

  it("updates only specific fields when others are undefined", async () => {
    const venue = Venue.create({
      id: "venue-1",
      name: "Old Hall",
      capacity: 500,
      address: "Old Address",
    });
    await venueRepo.save(venue);

    const command = new UpdateVenueCommand("venue-1", "Updated Hall", undefined, undefined);
    await handler.handle(command);

    const updated = await venueRepo.findById("venue-1");
    expect(updated?.name).toBe("Updated Hall");
    expect(updated?.capacity).toBe(500);
    expect(updated?.address).toBe("Old Address");
  });

  it("throws NotFoundError when venue does not exist", async () => {
    const command = new UpdateVenueCommand("nonexistent", "Name", 100, "Addr");

    await expect(handler.handle(command)).rejects.toThrow(NotFoundError);
  });

  it("throws ConflictError when trying to update to an already taken address", async () => {
    const venue1 = Venue.create({
      id: "venue-1",
      name: "Hall 1",
      capacity: 500,
      address: "Address 1",
    });
    const venue2 = Venue.create({
      id: "venue-2",
      name: "Hall 2",
      capacity: 600,
      address: "Taken Address",
    });
    await venueRepo.save(venue1);
    await venueRepo.save(venue2);

    const command = new UpdateVenueCommand("venue-1", undefined, undefined, "Taken Address");

    await expect(handler.handle(command)).rejects.toThrow(ConflictError);
  });

  it("does not check address availability if address remains the same", async () => {
    const venue = Venue.create({
      id: "venue-1",
      name: "Old Hall",
      capacity: 500,
      address: "Same Address",
    });
    await venueRepo.save(venue);

    const assertSpy = jest.spyOn(factory, "assertAddressAvailable");

    const command = new UpdateVenueCommand("venue-1", "New Name", undefined, "Same Address");
    await handler.handle(command);

    const updated = await venueRepo.findById("venue-1");
    expect(updated?.name).toBe("New Name");
    expect(updated?.address).toBe("Same Address");
    expect(assertSpy).not.toHaveBeenCalled();
  });
});
