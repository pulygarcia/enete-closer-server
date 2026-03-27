import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Vehicle, VehicleStatus } from '../../vehicles/entities/vehicle.entity';
import { Sale } from '../../sales/entities/sale.entity';

@Injectable()
export class DashboardFinderService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async getStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      available,
      reserved,
      recentVehicles,
      recentSales,
      stalledVehicles,
      monthlySales,
    ] = await Promise.all([
      this.vehicleRepository.count({
        where: { status: VehicleStatus.AVAILABLE },
      }),

      this.vehicleRepository.count({
        where: { status: VehicleStatus.RESERVED },
      }),

      // Últimos 5 vehículos agregados
      this.vehicleRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        select: ['id', 'brand', 'model', 'year', 'status', 'list_price', 'images', 'createdAt'],
      }),

      // Últimas 5 ventas
      this.saleRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['vehicle'],
      }),

      // Vehículos sin movimiento hace más de 30 días
      this.vehicleRepository.find({
        where: {
          status: VehicleStatus.AVAILABLE,
          updatedAt: MoreThanOrEqual(
            new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          ),
        },
        select: ['id', 'brand', 'model', 'year', 'list_price', 'updatedAt', 'condition'],
        order: { updatedAt: 'ASC' },
        take: 5,
      }),

      //sales of current month
      this.saleRepository.find({
        where: {
          createdAt: MoreThanOrEqual(firstDayOfMonth),
        },
      }),
    ]);

    const monthlyCommissions = monthlySales.reduce(
      (acc, sale) => acc + Number(sale.commission_earned),
      0,
    );

    return {
      counters: {
        available,
        reserved,
        monthlySales: monthlySales.length,
        monthlyCommissions,
      },
      recentVehicles,
      recentSales,
      stalledVehicles,
    };
  }
}