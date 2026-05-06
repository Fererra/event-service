import { UserRole } from "../../../../../shared/domain/value-objects/user-role.enum";

export class GetUserRegistrationQuery {
  constructor(
    public readonly registrationId: string,
    public readonly userId: string,
    public readonly executorId: string,
    public readonly executorRole: UserRole,
  ) {}
}
