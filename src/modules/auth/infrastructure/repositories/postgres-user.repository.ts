import { Repository } from "typeorm";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UserOrmEntity } from "../orm/entities/user.orm-entity";
import { UserMapper } from "../orm/mappers/user.mapper";

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly repo: Repository<UserOrmEntity>) {}

  async save(user: User): Promise<void> {
    const orm = UserMapper.toOrm(user);
    await this.repo.save(orm);
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) return null;
    return UserMapper.toDomain(orm);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { email: email.value } });
    if (!orm) return null;
    return UserMapper.toDomain(orm);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.repo.count({ where: { email: email.value } });
    return count > 0;
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    const count = await this.repo.count({ where: { nickname } });
    return count > 0;
  }
}
