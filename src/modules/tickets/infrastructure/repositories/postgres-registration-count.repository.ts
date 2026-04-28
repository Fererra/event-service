/**
 * TEMPORARY ADAPTER — will be replaced when the Registrations module is built.
 */

import { DataSource } from "typeorm";
import { IRegistrationCountRepository } from "../../domain/repositories/registration-count.repository.interface";

export class PostgresRegistrationCountRepository implements IRegistrationCountRepository {
  constructor(private dataSource: DataSource) {}
  async countByTicketId(ticketId: number): Promise<number> {
    const rows = await this.dataSource.query(
      "SELECT COUNT(*) AS count FROM registrations WHERE ticket_id = $1",
      [ticketId],
    );
    if (!rows || rows.length === 0) return 0;
    return Number(rows[0].count);
  }
}
