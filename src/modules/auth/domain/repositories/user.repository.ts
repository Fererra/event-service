import { User } from "../entities/user.entity";
import { Email } from "../value-objects/email.vo";

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
  existsByNickname(nickname: string): Promise<boolean>;
}
