import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Owner } from '../entities/owner.entity';
import { CreateOwnerDto } from '../dto/create-owner.dto';

@Injectable()
export class OwnerCreator {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async run(createOwnerDto: CreateOwnerDto): Promise<Owner> {
    const existingOwner = await this.ownerRepository.findOne({
      where: { phone: createOwnerDto.phone },
    });

    if (existingOwner) {
      throw new ConflictException('Ya existe un dueño con ese número de teléfono');
    }

    const owner = this.ownerRepository.create(createOwnerDto);
    return await this.ownerRepository.save(owner);
  }
}