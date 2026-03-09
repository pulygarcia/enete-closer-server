import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';

@Injectable()
export class SaleDeleter {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async run(id: string): Promise<void> {
    const result = await this.saleRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('La venta no existe');
    }
  }
}
