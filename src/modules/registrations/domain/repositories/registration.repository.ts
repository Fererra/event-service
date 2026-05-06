import { Registration } from "../entities/registration.entity";

export interface RegistrationRepository {
  save(registration: Registration): Promise<Registration>;
  findById(id: string): Promise<Registration | null>;
  countByTicketId(eventId: number, ticketId: number): Promise<number>;
  delete(id: string): Promise<void>;
}
