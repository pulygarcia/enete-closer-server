import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { Owner } from '../../owners/entities/owner.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';

@Injectable()
export class VehicleCreator {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async run(dto: CreateVehicleDto): Promise<Vehicle> {
    const owner = await this.ownerRepository.findOneBy({ id: dto.ownerId });
    if (!owner) {
      throw new NotFoundException(`El dueño con ID ${dto.ownerId} no existe.`);
    }

    //List price must cover the owner's price
    if (dto.list_price < dto.owner_price) {
      throw new BadRequestException('El precio de lista no puede ser menor al precio del dueño (comisión negativa)');
    }

    const vehicle = this.vehicleRepository.create({
      ...dto,
      owner: owner,
    });

    return await this.vehicleRepository.save(vehicle);
  }
}