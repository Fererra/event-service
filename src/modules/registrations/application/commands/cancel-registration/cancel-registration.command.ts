import { UserRole } from "../../../../../shared/domain/value-objects/user-role.enum";

export class CancelRegistrationCommand {
  constructor(
    public readonly registrationId: string,
    public readonly executorId: string,
    public readonly executorRole: UserRole,
  ) {}
}
