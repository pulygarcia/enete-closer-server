import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { VEHICLE_SEED_DATA } from '../data/vehicles';


@Injectable()
export class VehiclesSeeder {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async run(): Promise<number> {
    let inserted = 0;

    for (const data of VEHICLE_SEED_DATA) {
      const exists = await this.vehicleRepository.findOne({
        where: { plate: data.plate },
      });

      if (!exists) {
        const owner = this.vehicleRepository.create(data);
        await this.vehicleRepository.save(owner);
        inserted++;
      }
    }

    return inserted;
  }
}