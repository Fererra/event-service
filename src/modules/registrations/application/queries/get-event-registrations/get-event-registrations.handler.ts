import { RegistrationReadRepository } from "../../repositories/registration-read.repository";
import { GetEventRegistrationsQuery } from "./get-event-registrations.query";
import { RegistrationDetailModel } from "../registration-detail.model";
import { EventInfoRepositoryAdapter } from "../../../infrastructure/adapters/event-info.repository.adapter";
import { NotFoundError } from "../../../../../shared/domain/errors/domain.error";

export class GetEventRegistrationsQueryHandler {
  constructor(
    private readonly readRepository: RegistrationReadRepository,
    private readonly eventInfoRepository: EventInfoRepositoryAdapter,
  ) {}

  async handle(query: GetEventRegistrationsQuery): Promise<RegistrationDetailModel[]> {
    const event = await this.eventInfoRepository.findById(query.eventId);

    if (!event) {
      throw new NotFoundError(`Event with id ${query.eventId} not found`);
    }

    return this.readRepository.findByEventId(query.eventId);
  }
}
