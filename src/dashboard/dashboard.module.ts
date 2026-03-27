import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Sale } from '../sales/entities/sale.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardFinderService } from './services/dashboard-finder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Sale])],
  controllers: [DashboardController],
  providers: [DashboardFinderService],
})
export class DashboardModule {}