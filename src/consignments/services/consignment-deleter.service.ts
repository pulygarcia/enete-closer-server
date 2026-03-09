import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consignment } from '../entities/consignment.entity';

@Injectable()
export class ConsignmentDeleter {
  constructor(
    @InjectRepository(Consignment)
    private readonly consignmentRepository: Repository<Consignment>,
  ) {}

  async run(id: string): Promise<void> {
    const result = await this.consignmentRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('La consignación no existe');
    }
  }
}
