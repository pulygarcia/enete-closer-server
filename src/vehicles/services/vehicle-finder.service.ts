import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';

@Injectable()
export class VehicleFinder {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll(brand?: string) {
    return await this.vehicleRepository.find({
      relations: {
        owner: true,
      },
      // The filter is defined as a literal object
      where: brand ? { brand: ILike(`%${brand}%`) } : {},
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!vehicle) throw new NotFoundException('Vehículo no encontrado');
    return vehicle;
  }
}