import { Registration } from "../entities/registration.entity";

export interface RegistrationRepository {
  countByTicketId(ticketId: number): Promise<number>;
  save(registration: Registration): Promise<Registration>;
}
