import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consignment } from '../entities/consignment.entity';
import { Owner } from '../../owners/entities/owner.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { CreateConsignmentDto } from '../dto/create-consignment.dto';
import { CommissionType } from '../entities/consignment.entity';
import { VehicleStatus } from '../../vehicles/entities/vehicle.entity';

@Injectable()
export class ConsignmentCreator {
  constructor(
    @InjectRepository(Consignment)
    private readonly consignmentRepository: Repository<Consignment>,
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async run(dto: CreateConsignmentDto): Promise<Consignment> {
    const owner = await this.ownerRepository.findOneBy({ id: dto.ownerId });
    if (!owner) {
      throw new NotFoundException(`El dueño con ID ${dto.ownerId} no existe.`);
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: dto.vehicleId },
      relations: { owner: true },
    });
    if (!vehicle) {
      throw new NotFoundException(
        `El vehículo con ID ${dto.vehicleId} no existe.`,
      );
    }

    if (vehicle.owner.id !== dto.ownerId) {
      throw new BadRequestException(
        'El vehículo no pertenece al dueño indicado.',
      );
    }

    const existingConsignment = await this.consignmentRepository.findOne({
      where: { vehicle: { id: dto.vehicleId } },
    });
    if (existingConsignment) {
      throw new ConflictException(
        'Este vehículo ya tiene una consignación activa.',
      );
    }

    if (dto.commission_type === CommissionType.PERCENTAGE && dto.commission_value > 100) {
      throw new BadRequestException(
        'El porcentaje de comisión no puede superar 100.',
      );
    }

    const consignment = this.consignmentRepository.create({
      owner,
      vehicle,
      agreed_min_price: dto.agreed_min_price,
      commission_type: dto.commission_type,
      commission_value: dto.commission_value,
      notes: dto.notes,
      intake_date: new Date(dto.intake_date),
    });

    const saved = await this.consignmentRepository.save(consignment);

    await this.vehicleRepository.update(dto.vehicleId, {
      status: VehicleStatus.AVAILABLE,
    });

    return saved;
  }
}
