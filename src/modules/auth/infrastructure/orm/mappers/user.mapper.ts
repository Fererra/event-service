import { User } from "../../../domain/entities/user.entity";
import { Email } from "../../../domain/value-objects/email.vo";
import { parseUserRole } from "../../../domain/value-objects/user-role.vo";
import { UserOrmEntity } from "../entities/user.orm-entity";

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return User.fromPersistence({
      id: orm.id,
      email: Email.fromPersistence(orm.email),
      nickname: orm.nickname,
      passwordHash: orm.password,
      role: parseUserRole(orm.role),
      createdAt: orm.createdAt,
    });
  }

  static toOrm(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = user.id;
    orm.email = user.email.value;
    orm.nickname = user.nickname;
    orm.password = user.passwordHash;
    orm.role = user.role;
    orm.createdAt = user.createdAt;
    return orm;
  }
}
