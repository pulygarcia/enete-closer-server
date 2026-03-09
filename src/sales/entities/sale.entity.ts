import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Consignment } from '../../consignments/entities/consignment.entity';
import { CommissionType } from '../../consignments/entities/consignment.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  TRADE = 'TRADE',
  TRADE_DIFF = 'TRADE_DIFF',
  FINANCED = 'FINANCED',
}

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Vehicle, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @OneToOne(() => Consignment, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'consignment_id' })
  consignment: Consignment;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  sale_price: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  payment_method_used: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  trade_vehicle_description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  commission_earned: number;

  @Column({ type: 'date' })
  sale_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
