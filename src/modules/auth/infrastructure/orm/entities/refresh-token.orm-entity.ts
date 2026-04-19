import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserOrmEntity } from "./user.orm-entity";

@Entity("refresh_tokens")
export class RefreshTokenOrmEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ name: "token_hash", unique: true })
  tokenHash!: string;

  @Column({ name: "expires_at" })
  expiresAt!: Date;

  @Column({ name: "revoked_at", nullable: true, type: "timestamp" })
  revokedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => UserOrmEntity, (user) => user.refreshTokens)
  @JoinColumn({ name: "user_id" })
  user?: UserOrmEntity;
}
