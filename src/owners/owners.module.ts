// src/modules/owners/owners.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owner } from './entities/owner.entity';
import { OwnersController } from './owners.controller';

//Granular services
import { OwnerCreator } from './services/owner-creator.service';
import { OwnerFinder } from './services/owner-finder.service';
import { OwnerUpdater } from './services/owner-updater.service';
import { OwnerDeleter } from './services/owner-deleter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Owner]),
  ],
  controllers: [OwnersController],
  providers: [
    OwnerCreator,
    OwnerFinder,
    OwnerUpdater,
    OwnerDeleter,
  ],
  exports: [
    // Export in case other modules (like Vehicles) need to use these services
    OwnerFinder, 
  ],
})
export class OwnersModule {}