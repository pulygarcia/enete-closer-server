import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehicleUpdater {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async run(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.preload({
      id,
      ...dto,
    });

    if (!vehicle) throw new NotFoundException('No se encontró el vehículo para actualizar');

    return await this.vehicleRepository.save(vehicle);
  }
}