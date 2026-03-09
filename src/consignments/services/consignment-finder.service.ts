import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consignment } from '../entities/consignment.entity';
import { FilterConsignmentDto } from '../dto/filter-consignment.dto';

@Injectable()
export class ConsignmentFinder {
  constructor(
    @InjectRepository(Consignment)
    private readonly consignmentRepository: Repository<Consignment>,
  ) {}

  async findAll(filter?: FilterConsignmentDto) {
    const qb = this.consignmentRepository.createQueryBuilder('consignment')
      .leftJoinAndSelect('consignment.owner', 'owner')
      .leftJoinAndSelect('consignment.vehicle', 'vehicle')
      .orderBy('consignment.createdAt', 'DESC');

    if (filter?.status) {
      qb.andWhere('consignment.status = :status', { status: filter.status });
    }
    if (filter?.ownerId) {
      qb.andWhere('owner.id = :ownerId', { ownerId: filter.ownerId });
    }
    if (filter?.vehicleId) {
      qb.andWhere('vehicle.id = :vehicleId', {
        vehicleId: filter.vehicleId,
      });
    }

    return await qb.getMany();
  }

  async findById(id: string): Promise<Consignment> {
    const consignment = await this.consignmentRepository.findOne({
      where: { id },
      relations: { owner: true, vehicle: true },
    });

    if (!consignment) {
      throw new NotFoundException('Consignación no encontrada');
    }
    return consignment;
  }
}
