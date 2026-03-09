import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { FilterSaleDto } from '../dto/filter-sale.dto';

@Injectable()
export class SaleFinder {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async findAll(filter?: FilterSaleDto) {
    const qb = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.vehicle', 'vehicle')
      .leftJoinAndSelect('sale.consignment', 'consignment')
      .orderBy('sale.sale_date', 'DESC');

    if (filter?.vehicleId) {
      qb.andWhere('vehicle.id = :vehicleId', { vehicleId: filter.vehicleId });
    }
    if (filter?.consignmentId) {
      qb.andWhere('consignment.id = :consignmentId', {
        consignmentId: filter.consignmentId,
      });
    }
    if (filter?.paymentMethod) {
      qb.andWhere('sale.payment_method_used = :paymentMethod', {
        paymentMethod: filter.paymentMethod,
      });
    }
    if (filter?.saleDateFrom) {
      qb.andWhere('sale.sale_date >= :saleDateFrom', {
        saleDateFrom: filter.saleDateFrom,
      });
    }
    if (filter?.saleDateTo) {
      qb.andWhere('sale.sale_date <= :saleDateTo', {
        saleDateTo: filter.saleDateTo,
      });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: { vehicle: true, consignment: { owner: true } },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }
    return sale;
  }
}
