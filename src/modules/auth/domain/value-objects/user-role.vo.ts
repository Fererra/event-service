import { DomainError } from "../../../../shared/domain/errors/domain.error";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export function parseUserRole(value: string): UserRole {
  if (value === UserRole.USER) return UserRole.USER;
  if (value === UserRole.ADMIN) return UserRole.ADMIN;
  throw new DomainError(`Unknown user role: ${value}`);
}
