import { DeleteVenueUseCase } from "../../../../src/modules/venue/application/use-cases/delete-venue.use-case";
import { Venue } from "../../../../src/modules/venue/domain/entities/venue.entity";
import { ConflictError, NotFoundError } from "../../../../src/shared/domain/errors/domain.error";
import { InMemoryVenueRepository, FakeVenueEventChecker } from "./fakes";

describe("DeleteVenueUseCase", () => {
  let useCase: DeleteVenueUseCase;
  let venueRepo: InMemoryVenueRepository;
  let eventChecker: FakeVenueEventChecker;

  beforeEach(() => {
    venueRepo = new InMemoryVenueRepository();
    eventChecker = new FakeVenueEventChecker();
    useCase = new DeleteVenueUseCase(venueRepo, eventChecker);
  });

  it("deletes venue successfully", async () => {
    const venue = Venue.create({
      id: "venue-1",
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });
    await venueRepo.save(venue);

    await useCase.execute("venue-1");

    const deleted = await venueRepo.findById("venue-1");
    expect(deleted).toBeNull();
  });

  it("throws NotFoundError when venue not found", async () => {
    await expect(useCase.execute("nonexistent")).rejects.toThrow(NotFoundError);
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

    await expect(useCase.execute("venue-1")).rejects.toThrow(ConflictError);
  });
});
