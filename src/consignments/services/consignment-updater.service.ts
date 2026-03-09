import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consignment } from '../entities/consignment.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { UpdateConsignmentDto } from '../dto/update-consignment.dto';
import { ConsignmentStatus } from '../entities/consignment.entity';
import { CommissionType } from '../entities/consignment.entity';
import { VehicleStatus } from '../../vehicles/entities/vehicle.entity';

@Injectable()
export class ConsignmentUpdater {
  constructor(
    @InjectRepository(Consignment)
    private readonly consignmentRepository: Repository<Consignment>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async run(id: string, dto: UpdateConsignmentDto): Promise<Consignment> {
    const consignment = await this.consignmentRepository.findOne({
      where: { id },
      relations: { owner: true, vehicle: true },
    });

    if (!consignment) {
      throw new NotFoundException('Consignación no encontrada');
    }

    if (dto.commission_type === CommissionType.PERCENTAGE && dto.commission_value != null && dto.commission_value > 100) {
      throw new BadRequestException(
        'El porcentaje de comisión no puede superar 100.',
      );
    }

    const updateData: Partial<Consignment> = {};
    if (dto.agreed_min_price != null) updateData.agreed_min_price = dto.agreed_min_price;
    if (dto.commission_type != null) updateData.commission_type = dto.commission_type;
    if (dto.commission_value != null) updateData.commission_value = dto.commission_value;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.intake_date != null) updateData.intake_date = new Date(dto.intake_date);

    if (dto.status != null && dto.status !== consignment.status) {
      updateData.status = dto.status;

      if (dto.status === ConsignmentStatus.SOLD) {
        await this.vehicleRepository.update(consignment.vehicle.id, {
          status: VehicleStatus.SOLD,
        });
      }
    }

    await this.consignmentRepository.update(id, updateData);

    return this.consignmentRepository.findOneOrFail({
      where: { id },
      relations: { owner: true, vehicle: true },
    });
  }
}
