import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { TicketOrmEntity } from "../../../../tickets/infrastructure/orm/entities/ticket.orm-entity";

@Entity("registrations")
export class RegistrationOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "ticket_id", type: "int" })
  ticketId!: number;

  @ManyToOne(() => TicketOrmEntity)
  @JoinColumn({ name: "ticket_id" })
  ticket!: TicketOrmEntity;

  @CreateDateColumn({ name: "registration_timestamp", type: "timestamptz" })
  registrationTimestamp!: Date;
}
