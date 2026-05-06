import { RegistrationDetailModel } from "../queries/registration-detail.model";

export interface RegistrationReadRepository {
  findByUserId(userId: string): Promise<RegistrationDetailModel[]>;
  findByIdAndUserId(id: string, userId: string): Promise<RegistrationDetailModel | null>;
  findByEventId(eventId: number): Promise<RegistrationDetailModel[]>;
  findByIdAndEventId(id: string, eventId: number): Promise<RegistrationDetailModel | null>;
  countByEventAndTicket(eventId: number, ticketId: number): Promise<number>;
}
