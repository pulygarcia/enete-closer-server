import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Owner } from '../entities/owner.entity';

@Injectable()
export class OwnerFinder {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async findAll() {
    return await this.ownerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Owner> {
    const owner = await this.ownerRepository.findOne({ where: { id } });
    if (!owner) throw new NotFoundException('Dueño no encontrado');
    return owner;
  }
}