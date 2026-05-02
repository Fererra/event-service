import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { EventStatus } from "../../../domain/value-objects/event-status.enum";

@Entity("events")
export class EventOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "owner_id", type: "varchar" })
  ownerId!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255 })
  organisator!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ name: "start_timestamp", type: "timestamptz" })
  startTimestamp!: Date;

  @Column({ name: "end_timestamp", type: "timestamptz" })
  endTimestamp!: Date;

  @Column({ type: "enum", enum: EventStatus, default: EventStatus.IN_PLANNING })
  status!: EventStatus;

  @Column({ name: "venue_id", type: "varchar" })
  venueId!: string;

  @Column({ name: "created_at", type: "timestamptz", default: () => "NOW()" })
  createdAt!: Date;
}
