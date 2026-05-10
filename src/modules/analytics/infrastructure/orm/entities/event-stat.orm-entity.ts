import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("analytics_event_stats")
export class EventStatOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "event_id", type: "int", unique: true })
  eventId!: number;

  @Column({ name: "event_name", type: "varchar", length: 255 })
  eventName!: string;

  @Column({ name: "total_registrations", type: "int", default: 0 })
  totalRegistrations!: number;

  @Column({ name: "cancelled_at", type: "timestamptz", nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: "last_activity_at", type: "timestamptz", default: () => "NOW()" })
  lastActivityAt!: Date;
}
