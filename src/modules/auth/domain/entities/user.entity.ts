import { Email } from "../value-objects/email.vo";
import { UserRole } from "../value-objects/user-role.vo";

export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private _nickname: string,
    private readonly _passwordHash: string,
    private readonly _role: UserRole,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    email: Email;
    nickname: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
  }): User {
    return new User(
      params.id,
      params.email,
      params.nickname,
      params.passwordHash,
      params.role,
      params.createdAt,
    );
  }

  static fromPersistence(params: {
    id: string;
    email: Email;
    nickname: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
  }): User {
    return new User(
      params.id,
      params.email,
      params.nickname,
      params.passwordHash,
      params.role,
      params.createdAt,
    );
  }

  get id(): string {
    return this._id;
  }
  get email(): Email {
    return this._email;
  }
  get nickname(): string {
    return this._nickname;
  }
  get passwordHash(): string {
    return this._passwordHash;
  }
  get role(): UserRole {
    return this._role;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  equals(other: User): boolean {
    return this._id === other._id;
  }
}
