import { UserRole } from "../../../../shared/domain/value-objects/user-role.enum";

export interface RegistrationProps {
  id: string;
  userId: string;
  ticketId: number;
  registrationTimestamp: Date;
}

export class Registration {
  private constructor(private readonly props: RegistrationProps) {}

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get ticketId(): number {
    return this.props.ticketId;
  }
  get registrationTimestamp(): Date {
    return this.props.registrationTimestamp;
  }

  static create(props: { id: string; userId: string; ticketId: number }): Registration {
    return new Registration({
      ...props,
      registrationTimestamp: new Date(),
    });
  }

  static fromProps(props: RegistrationProps): Registration {
    return new Registration(props);
  }

  canBeCancelledBy(actorId: string, actorRole: UserRole): boolean {
    return this.userId === actorId || actorRole === UserRole.ADMIN;
  }
}
