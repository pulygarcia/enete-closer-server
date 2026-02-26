import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Owner } from '../owners/entities/owner.entity';
import { VehiclesController } from './vehicles.controller';
import { VehicleCreator } from './services/vehicle-creator.service';
import { VehicleFinder } from './services/vehicle-finder.service';
import { VehicleUpdater } from './services/vehicle-updater.service';
import { VehicleDeleter } from './services/vehicle-deleter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, Owner]),
  ],
  controllers: [VehiclesController],
  providers: [
    VehicleCreator,
    VehicleFinder,
    VehicleUpdater,
    VehicleDeleter,
  ],
  exports: [
    VehicleCreator,
    VehicleFinder,
    VehicleUpdater,
    VehicleDeleter,
  ],
})
export class VehiclesModule {}
