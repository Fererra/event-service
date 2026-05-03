import { IRegistrationCountRepository } from "../../domain/repositories/registration-count.repository.interface";
import { GetRegistrationsCountUseCase } from "../../../registrations/application/use-cases/get-registrations-count.use-case";

export class RegistrationModuleAdapter implements IRegistrationCountRepository {
  constructor(private readonly getRegistrationsCountUseCase: GetRegistrationsCountUseCase) {}
  async countByTicketId(eventId: number, ticketId: number): Promise<number> {
    return this.getRegistrationsCountUseCase.execute(eventId, ticketId);
  }
}
