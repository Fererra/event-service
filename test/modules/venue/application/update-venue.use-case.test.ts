import { UpdateVenueUseCase } from "../../../../src/modules/venue/application/use-cases/update-venue.use-case";
import { VenueFactory } from "../../../../src/modules/venue/domain/factories/venue.factory";
import { Venue } from "../../../../src/modules/venue/domain/entities/venue.entity";
import { ConflictError, NotFoundError } from "../../../../src/shared/domain/errors/domain.error";
import { InMemoryVenueRepository } from "./fakes";

describe("UpdateVenueUseCase", () => {
  let useCase: UpdateVenueUseCase;
  let venueRepo: InMemoryVenueRepository;
  let factory: VenueFactory;

  beforeEach(() => {
    venueRepo = new InMemoryVenueRepository();
    factory = new VenueFactory(venueRepo);
    useCase = new UpdateVenueUseCase(venueRepo, factory);
  });

  it("updates venue name", async () => {
    const venue = Venue.create({
      id: "venue-1",
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });
    await venueRepo.save(venue);

    await useCase.execute({
      id: "venue-1",
      name: "New Hall",
    });

    const updated = await venueRepo.findById("venue-1");
    expect(updated?.name).toBe("New Hall");
  });

  it("updates venue capacity", async () => {
    const venue = Venue.create({
      id: "venue-1",
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });
    await venueRepo.save(venue);

    await useCase.execute({
      id: "venue-1",
      capacity: 1000,
    });

    const updated = await venueRepo.findById("venue-1");
    expect(updated?.capacity).toBe(1000);
  });

  it("throws NotFoundError when venue not found", async () => {
    await expect(
      useCase.execute({
        id: "nonexistent",
        name: "New Hall",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ConflictError when updating address to existing one", async () => {
    const venue1 = Venue.create({
      id: "venue-1",
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });
    const venue2 = Venue.create({
      id: "venue-2",
      name: "Other Hall",
      capacity: 300,
      address: "456 Other Ave",
    });
    await venueRepo.save(venue1);
    await venueRepo.save(venue2);

    await expect(
      useCase.execute({
        id: "venue-1",
        address: "456 Other Ave",
      }),
    ).rejects.toThrow(ConflictError);
  });
});
