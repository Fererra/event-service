export class UpdateVenueCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly capacity?: number | null,
    public readonly address?: string,
  ) {}
}
