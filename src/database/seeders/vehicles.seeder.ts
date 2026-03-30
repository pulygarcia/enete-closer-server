import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { VEHICLE_SEED_DATA } from '../data/vehicles';
import { Owner } from 'src/owners/entities/owner.entity';


@Injectable()
export class VehiclesSeeder {
  constructor(
  @InjectRepository(Vehicle)
  private readonly vehicleRepository: Repository<Vehicle>,
  @InjectRepository(Owner)
    private readonly ownersRepository: Repository<Owner>,
  ) {}

  async run(): Promise<number> {
    let inserted = 0;

    const owners = await this.ownersRepository.find();

    if (owners.length === 0) {
      throw new Error('No hay owners en la BD. Ejecutá el OwnersSeeder primero.')
    }

    //Por cada vehículo del seed...
    for (const data of VEHICLE_SEED_DATA) {
      //Verificamos que no exista ya
      const exists = await this.vehicleRepository.findOne({
        where: { plate: data.plate },
      });

      if (exists) continue;

      //Elegimos un owner al azar
      const randomOwner = owners[Math.floor(Math.random() * owners.length)];

      //Creamos y guardamos el vehículo con ese owner
      const vehicle = this.vehicleRepository.create({
        ...data,
        owner: randomOwner,
      });

      await this.vehicleRepository.save(vehicle);
      inserted++;
    }

    return inserted;
  }
}