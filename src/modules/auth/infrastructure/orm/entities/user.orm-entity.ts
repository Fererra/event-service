import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { RefreshTokenOrmEntity } from "./refresh-token.orm-entity";

@Entity("users")
export class UserOrmEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  nickname!: string;

  @Column()
  password!: string;

  @Column({ type: "varchar", default: "user" })
  role!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => RefreshTokenOrmEntity, (token) => token.user)
  refreshTokens?: RefreshTokenOrmEntity[];
}
