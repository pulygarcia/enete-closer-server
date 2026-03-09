import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Owner } from '../../owners/entities/owner.entity';

// Avoid using strings, use the enum instead
export enum Transmission {
  MANUAL = 'Manual',
  AUTOMATIC = 'Automático',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  km: number;

  @Column({
    type: 'enum',
    enum: Transmission,
    default: Transmission.MANUAL,
  })
  transmission: Transmission;

  //Using precision 12, scale 2 to handle large amounts without rounding errors
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  owner_price: number; 

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  list_price: number; 

  @Column({ type: 'boolean', default: false })
  accepts_trade: boolean;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;

  @Column({ type: 'simple-array', nullable: true })
  images: string[]; // We will store up to 3 URLs from Cloudinary

  @ManyToOne(() => Owner, (owner) => owner.id, { 
    onDelete: 'CASCADE', //Owner deletion will delete all vehicles
    nullable: false 
  })
  @JoinColumn({ name: 'owner_id' })
  owner: Owner;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
