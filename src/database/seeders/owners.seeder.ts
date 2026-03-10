import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OWNER_SEED_DATA } from '../data/owners';
import { Owner } from 'src/owners/entities/owner.entity';


@Injectable()
export class OwnersSeeder {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async run(): Promise<number> {
    let inserted = 0;

    for (const data of OWNER_SEED_DATA) {
      const exists = await this.ownerRepository.findOne({
        where: { phone: data.phone },
      });

      if (!exists) {
        const owner = this.ownerRepository.create(data);
        await this.ownerRepository.save(owner);
        inserted++;
      }
    }

    return inserted;
  }
}
