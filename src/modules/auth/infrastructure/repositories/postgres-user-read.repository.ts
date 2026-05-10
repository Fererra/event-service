import { Repository } from "typeorm";
import { IUserReadRepository } from "../../application/ports/user-read.repository";
import { UserReadModel } from "../../application/queries/read-models/user.read-model";
import { UserOrmEntity } from "../orm/entities/user.orm-entity";

export class PostgresUserReadRepository implements IUserReadRepository {
  constructor(private readonly ormRepo: Repository<UserOrmEntity>) {}

  async findById(id: string): Promise<UserReadModel | null> {
    const row = await this.ormRepo.findOne({
      where: { id },
      select: ["id", "email", "nickname", "role", "createdAt"],
    });

    if (!row) return null;

    return this.toReadModel(row);
  }

  async findAll(): Promise<UserReadModel[]> {
    const rows = await this.ormRepo.find({
      select: ["id", "email", "nickname", "role", "createdAt"],
      order: { createdAt: "DESC" },
    });

    return rows.map(this.toReadModel);
  }

  private toReadModel(row: UserOrmEntity): UserReadModel {
    return {
      id: row.id,
      email: row.email,
      nickname: row.nickname,
      role: row.role,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
