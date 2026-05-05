import { CreateVenueUseCase } from "../../../../src/modules/venue/application/use-cases/create-venue.use-case";
import { VenueFactory } from "../../../../src/modules/venue/domain/factories/venue.factory";
import { ConflictError } from "../../../../src/shared/domain/errors/domain.error";
import { InMemoryVenueRepository } from "./fakes";

describe("CreateVenueUseCase", () => {
  let useCase: CreateVenueUseCase;
  let venueRepo: InMemoryVenueRepository;
  let factory: VenueFactory;

  beforeEach(() => {
    venueRepo = new InMemoryVenueRepository();
    factory = new VenueFactory(venueRepo);
    useCase = new CreateVenueUseCase(venueRepo, factory);
  });

  it("creates and saves a new venue", async () => {
    const venueId = await useCase.execute({
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });

    expect(venueId).toBeDefined();
    const saved = await venueRepo.findById(venueId);
    expect(saved).not.toBeNull();
    expect(saved?.name).toBe("Main Hall");
  });

  it("throws ConflictError when address already exists", async () => {
    await useCase.execute({
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });

    await expect(
      useCase.execute({
        name: "Other Hall",
        capacity: 300,
        address: "123 Main St",
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("allows different addresses", async () => {
    const id1 = await useCase.execute({
      name: "Main Hall",
      capacity: 500,
      address: "123 Main St",
    });

    const id2 = await useCase.execute({
      name: "Other Hall",
      capacity: 300,
      address: "456 Other Ave",
    });

    expect(id1).not.toBe(id2);
  });
});
