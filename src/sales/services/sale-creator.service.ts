import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { Consignment } from '../../consignments/entities/consignment.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { CreateSaleDto } from '../dto/create-sale.dto';
import {
  CommissionType,
  ConsignmentStatus,
} from '../../consignments/entities/consignment.entity';
import { VehicleStatus } from '../../vehicles/entities/vehicle.entity';

@Injectable()
export class SaleCreator {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Consignment)
    private readonly consignmentRepository: Repository<Consignment>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async run(dto: CreateSaleDto): Promise<Sale> {
    const consignment = await this.consignmentRepository.findOne({
      where: { id: dto.consignmentId },
      relations: { owner: true, vehicle: true },
    });

    if (!consignment) {
      throw new NotFoundException(
        `La consignación con ID ${dto.consignmentId} no existe.`,
      );
    }

    if (consignment.status === ConsignmentStatus.SOLD) {
      throw new ConflictException(
        'Esta consignación ya tiene una venta registrada.',
      );
    }

    if (consignment.status === ConsignmentStatus.WITHDRAWN) {
      throw new BadRequestException(
        'No se puede registrar venta en una consignación retirada.',
      );
    }

    const salePrice = Number(dto.sale_price);
    const agreedMinPrice = Number(consignment.agreed_min_price);
    if (salePrice < agreedMinPrice) {
      throw new BadRequestException(
        `El precio de venta no puede ser menor al precio mínimo acordado (${agreedMinPrice}).`,
      );
    }

    const commissionValue = Number(consignment.commission_value);
    let commissionEarned: number;
    if (consignment.commission_type === CommissionType.FIXED) {
      commissionEarned = commissionValue;
    } else {
      commissionEarned = (salePrice * commissionValue) / 100;
    }

    const sale = this.saleRepository.create({
      vehicle: consignment.vehicle,
      consignment,
      sale_price: salePrice,
      payment_method_used: dto.payment_method_used,
      trade_vehicle_description: dto.trade_vehicle_description,
      commission_earned: commissionEarned,
      sale_date: new Date(dto.sale_date),
      notes: dto.notes,
    });

    const savedSale = await this.saleRepository.save(sale);

    await this.vehicleRepository.update(consignment.vehicle.id, {
      status: VehicleStatus.SOLD,
    });

    await this.consignmentRepository.update(dto.consignmentId, {
      status: ConsignmentStatus.SOLD,
    });

    return this.saleRepository.findOneOrFail({
      where: { id: savedSale.id },
      relations: { vehicle: true, consignment: true },
    });
  }
}
