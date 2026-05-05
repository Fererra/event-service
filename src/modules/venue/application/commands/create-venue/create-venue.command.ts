export class CreateVenueCommand {
  constructor(
    public readonly name: string,
    public readonly capacity: number | null,
    public readonly address: string,
  ) {}
}
