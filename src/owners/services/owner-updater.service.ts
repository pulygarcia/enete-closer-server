import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Owner } from '../entities/owner.entity';
import { UpdateOwnerDto } from '../dto/update-owner.dto';

@Injectable()
export class OwnerUpdater {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async run(id: string, updateOwnerDto: UpdateOwnerDto): Promise<Owner> {
    //preload find and merge with the updateOwnerDto changes
    const owner = await this.ownerRepository.preload({
      id: id,
      ...updateOwnerDto,
    });

    if (!owner) {
      throw new NotFoundException(`No se encontró el dueño con ID: ${id}`);
    }

    return await this.ownerRepository.save(owner);
  }
}