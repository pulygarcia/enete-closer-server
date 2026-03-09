import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consignment } from './entities/consignment.entity';
import { Owner } from '../owners/entities/owner.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { ConsignmentsController } from './consignments.controller';
import { ConsignmentCreator } from './services/consignment-creator.service';
import { ConsignmentFinder } from './services/consignment-finder.service';
import { ConsignmentUpdater } from './services/consignment-updater.service';
import { ConsignmentDeleter } from './services/consignment-deleter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consignment, Owner, Vehicle]),
  ],
  controllers: [ConsignmentsController],
  providers: [
    ConsignmentCreator,
    ConsignmentFinder,
    ConsignmentUpdater,
    ConsignmentDeleter,
  ],
  exports: [
    ConsignmentCreator,
    ConsignmentFinder,
    ConsignmentUpdater,
    ConsignmentDeleter,
  ],
})
export class ConsignmentsModule {}
