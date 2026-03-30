import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Owner } from '../entities/owner.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';

@Injectable()
export class OwnerDeleter {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async run(id: string): Promise<void> {
    const result = await this.ownerRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`No se pudo eliminar: Dueño con ID ${id} no encontrado`);
    }

    await this.vehicleRepository.softDelete({ owner: { id } });
  }
}