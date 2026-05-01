import { Registration } from "../entities/registration.entity";

export interface RegistrationRepository {
  countByTicketId(ticketId: number): Promise<number>;
  save(registration: Registration): Promise<Registration>;

  findByUserId(userId: string): Promise<Registration[]>;
  findByIdAndUserId(id: string, userId: string): Promise<Registration | null>;
  findByEventId(eventId: number): Promise<Registration[]>;
  findByIdAndEventId(id: string, eventId: number): Promise<Registration | null>;
}
