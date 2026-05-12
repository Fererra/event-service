import { IRegistrationCountRepository } from "../../domain/repositories/registration-count.repository.interface";
import { RegistrationApi } from "../../../registrations/api/registration.api";

export class RegistrationModuleAdapter implements IRegistrationCountRepository {
  constructor(private readonly registrationModule: RegistrationApi) {}
  async countByTicketId(eventId: number, ticketId: number): Promise<number> {
    const response = await this.registrationModule.getRegistrationsCount({
      eventId,
      ticketId,
    });
    return response.count;
  }
}
