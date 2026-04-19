import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class RefreshToken {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _tokenHash: string,
    private readonly _expiresAt: Date,
    private _revokedAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  }): RefreshToken {
    return new RefreshToken(
      params.id,
      params.userId,
      params.tokenHash,
      params.expiresAt,
      null,
      params.createdAt,
    );
  }

  static fromPersistence(params: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }): RefreshToken {
    return new RefreshToken(
      params.id,
      params.userId,
      params.tokenHash,
      params.expiresAt,
      params.revokedAt,
      params.createdAt,
    );
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get tokenHash(): string {
    return this._tokenHash;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get revokedAt(): Date | null {
    return this._revokedAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  isExpired(): boolean {
    return this._expiresAt < new Date();
  }

  isRevoked(): boolean {
    return this._revokedAt !== null;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  revoke(): void {
    if (this.isRevoked()) {
      throw new DomainError("Refresh token is already revoked");
    }
    this._revokedAt = new Date();
  }
}
