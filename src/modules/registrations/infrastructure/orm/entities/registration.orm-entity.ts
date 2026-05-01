import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("registrations")
export class RegistrationOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "ticket_id", type: "int" })
  ticketId!: number;

  @CreateDateColumn({ name: "registration_timestamp", type: "timestamptz" })
  registrationTimestamp!: Date;
}
