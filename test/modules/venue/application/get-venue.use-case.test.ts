import { GetVenueByIdUseCase } from "../../../../src/modules/venue/application/use-cases/get-venue-by-id.use-case";
import { Venue } from "../../../../src/modules/venue/domain/entities/venue.entity";
import { NotFoundError } from "../../../../src/shared/domain/errors/domain.error";
import { InMemoryVenueRepository } from "./fakes";

describe("GetVenueByIdUseCase", () => {
  let useCase: GetVenueByIdUseCase;
  let venueRepo: InMemoryVenueRepository;

  beforeEach(() => {
    venueRepo = new InMemoryVenueRepository();
    useCase = new GetVenueByIdUseCase(venueRepo);
  });

  it("returns venue by id", async () => {
    const venue = Venue.create({
      id: "venue-1",
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });
    await venueRepo.save(venue);

    const result = await useCase.execute("venue-1");

    expect(result.id).toBe("venue-1");
    expect(result.name).toBe("Main Hall");
    expect(result.capacity).toBe(500);
  });

  it("throws NotFoundError when venue not found", async () => {
    await expect(useCase.execute("nonexistent")).rejects.toThrow(NotFoundError);
  });
});
