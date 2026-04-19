import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw new DomainError(`Invalid email format: ${raw}`);
    }
    return new Email(normalized);
  }

  static fromPersistence(value: string): Email {
    return new Email(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
