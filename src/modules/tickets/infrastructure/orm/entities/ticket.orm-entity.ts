import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { TicketType } from "../../../domain/value-objects/ticket-type.enum";

@Entity("tickets")
export class TicketOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "event_id", type: "int" })
  eventId!: number;

  @Column({ type: "enum", enum: TicketType })
  type!: TicketType;

  @Column({ type: "int" })
  limit!: number;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number): number => value,
      from: (value: string): number => Number(value),
    },
  })
  price!: number;
}
