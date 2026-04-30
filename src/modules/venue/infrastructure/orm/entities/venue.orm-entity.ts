import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('venues')
export class VenueOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @Column()
  address!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
