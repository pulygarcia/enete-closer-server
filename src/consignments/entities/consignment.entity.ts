import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Owner } from '../../owners/entities/owner.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export enum CommissionType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum ConsignmentStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  WITHDRAWN = 'WITHDRAWN',
}

@Entity('consignments')
export class Consignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Owner, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: Owner;

  @OneToOne(() => Vehicle, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  agreed_min_price: number;

  @Column({
    type: 'enum',
    enum: CommissionType,
  })
  commission_type: CommissionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  commission_value: number;

  @Column({
    type: 'enum',
    enum: ConsignmentStatus,
    default: ConsignmentStatus.ACTIVE,
  })
  status: ConsignmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date' })
  intake_date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
