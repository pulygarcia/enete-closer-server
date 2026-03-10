import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owner } from 'src/owners/entities/owner.entity';
import { OwnersSeeder } from './seeders/owners.seeder';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { VehiclesSeeder } from './seeders/vehicles.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Owner, Vehicle])],
  providers: [OwnersSeeder, VehiclesSeeder],
  exports: [OwnersSeeder, VehiclesSeeder],
})
export class DatabaseSeedModule {}
