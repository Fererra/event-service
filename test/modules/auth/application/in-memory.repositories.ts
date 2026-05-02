import { User } from "../../../../src/modules/auth/domain/entities/user.entity";
import { RefreshToken } from "../../../../src/modules/auth/domain/entities/refresh-token.entity";
import { Email } from "../../../../src/modules/auth/domain/value-objects/email.vo";
import { UserRepository } from "../../../../src/modules/auth/domain/repositories/user.repository";
import { RefreshTokenRepository } from "../../../../src/modules/auth/domain/repositories/refresh-token.repository";

export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.email.equals(email)) return user;
    }
    return null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    for (const user of this.store.values()) {
      if (user.email.equals(email)) return true;
    }
    return false;
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    for (const user of this.store.values()) {
      if (user.nickname === nickname) return true;
    }
    return false;
  }

  getAll(): User[] {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private readonly store = new Map<string, RefreshToken>();

  async save(token: RefreshToken): Promise<void> {
    this.store.set(token.id, token);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    for (const token of this.store.values()) {
      if (token.tokenHash === tokenHash) return token;
    }
    return null;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    for (const token of this.store.values()) {
      if (token.userId === userId && !token.isRevoked()) {
        token.revoke();
      }
    }
  }

  async update(token: RefreshToken): Promise<void> {
    this.store.set(token.id, token);
  }

  getAll(): RefreshToken[] {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}
