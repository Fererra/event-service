/**
 * TEMPORARY ADAPTER — will be replaced when the Venues module is built.
 */

import { DataSource } from "typeorm";
import { VenueData, IVenueRepository } from "../../domain/repositories/venue.repository.interface";

export class PostgresVenueRepository implements IVenueRepository {
  constructor(private dataSource: DataSource) {}

  async findById(id: number): Promise<VenueData | null> {
    const rows = await this.dataSource.query("SELECT id, capacity FROM venues WHERE id = $1", [id]);
    if (!rows || rows.length === 0) return null;
    return {
      id: rows[0].id,
      capacity: rows[0].capacity !== null ? Number(rows[0].capacity) : null,
    };
  }
}
