import { UserRole } from "../../../../../shared/domain/value-objects/user-role.enum";

export class GetUserRegistrationsQuery {
  constructor(
    public readonly userId: string,
    public readonly executorId: string,
    public readonly executorRole: UserRole,
  ) {}
}
