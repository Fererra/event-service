import { IsNull, Repository } from "typeorm";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { RefreshTokenOrmEntity } from "../orm/entities/refresh-token.orm-entity";
import { RefreshTokenMapper } from "../orm/mappers/refresh-token.mapper";

export class PostgresRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly repo: Repository<RefreshTokenOrmEntity>) {}

  async save(token: RefreshToken): Promise<void> {
    const orm = RefreshTokenMapper.toOrm(token);
    await this.repo.save(orm);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const orm = await this.repo.findOne({ where: { tokenHash } });
    if (!orm) return null;
    return RefreshTokenMapper.toDomain(orm);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async update(token: RefreshToken): Promise<void> {
    const orm = RefreshTokenMapper.toOrm(token);
    await this.repo.save(orm);
  }
}
