import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { Consignment } from '../consignments/entities/consignment.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { SalesController } from './sales.controller';
import { SaleCreator } from './services/sale-creator.service';
import { SaleFinder } from './services/sale-finder.service';
import { SaleDeleter } from './services/sale-deleter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, Consignment, Vehicle]),
  ],
  controllers: [SalesController],
  providers: [SaleCreator, SaleFinder, SaleDeleter],
  exports: [SaleCreator, SaleFinder, SaleDeleter],
})
export class SalesModule {}
