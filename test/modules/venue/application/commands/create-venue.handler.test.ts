import { CreateVenueCommandHandler } from "../../../../../src/modules/venue/application/commands/create-venue/create-venue.handler";
import { CreateVenueCommand } from "../../../../../src/modules/venue/application/commands/create-venue/create-venue.command";
import { VenueFactory } from "../../../../../src/modules/venue/domain/factories/venue.factory";
import { ConflictError } from "../../../../../src/shared/domain/errors/domain.error";
import { InMemoryVenueRepository } from "../fakes";

describe("CreateVenueCommandHandler", () => {
  let handler: CreateVenueCommandHandler;
  let venueRepo: InMemoryVenueRepository;
  let factory: VenueFactory;

  beforeEach(() => {
    venueRepo = new InMemoryVenueRepository();
    factory = new VenueFactory(venueRepo);
    handler = new CreateVenueCommandHandler(venueRepo, factory);
  });

  it("creates and saves a new venue", async () => {
    const command = new CreateVenueCommand("Main Hall", 500, "123 Main St");
    const venueId = await handler.handle(command);

    expect(venueId).toBeDefined();
    const saved = await venueRepo.findById(venueId);
    expect(saved).not.toBeNull();
    expect(saved?.name).toBe("Main Hall");
  });

  it("throws ConflictError when address already exists", async () => {
    await handler.handle(new CreateVenueCommand("Main Hall", 500, "123 Main St"));

    const command2 = new CreateVenueCommand("Other Hall", 300, "123 Main St");
    await expect(handler.handle(command2)).rejects.toThrow(ConflictError);
  });
});
