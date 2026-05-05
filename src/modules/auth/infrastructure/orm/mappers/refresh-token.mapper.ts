import { RefreshToken } from "../../../domain/entities/refresh-token.entity";
import { RefreshTokenOrmEntity } from "../entities/refresh-token.orm-entity";

export class RefreshTokenMapper {
  static toDomain(orm: RefreshTokenOrmEntity): RefreshToken {
    return RefreshToken.fromPersistence({
      id: orm.id,
      userId: orm.userId,
      tokenHash: orm.tokenHash,
      expiresAt: orm.expiresAt,
      revokedAt: orm.revokedAt,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(token: RefreshToken): RefreshTokenOrmEntity {
    const orm = new RefreshTokenOrmEntity();
    orm.id = token.id;
    orm.userId = token.userId;
    orm.tokenHash = token.tokenHash;
    orm.expiresAt = token.expiresAt;
    orm.revokedAt = token.revokedAt;
    orm.createdAt = token.createdAt;
    return orm;
  }
}
