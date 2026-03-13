import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SaleDeleter } from './sale-deleter.service';
import { Sale } from '../entities/sale.entity';

describe('SaleDeleter', () => {
  let service: SaleDeleter;
  let saleRepository: jest.Mocked<Repository<Sale>>;

  beforeEach(async () => {
    const mockRepository = {
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleDeleter,
        {
          provide: getRepositoryToken(Sale),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SaleDeleter>(SaleDeleter);
    saleRepository = module.get(getRepositoryToken(Sale));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe eliminar (soft delete) una venta exitosamente', async () => {
      jest.spyOn(saleRepository, 'softDelete').mockResolvedValue({ affected: 1, raw: [] } as any);

      await service.run('uuid-sale-1');

      expect(saleRepository.softDelete).toHaveBeenCalledWith('uuid-sale-1');
    });

    it('debe lanzar NotFoundException cuando la venta no existe', async () => {
      jest.spyOn(saleRepository, 'softDelete').mockResolvedValue({ affected: 0, raw: [] } as any);

      await expect(service.run('uuid-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.run('uuid-inexistente')).rejects.toThrow('La venta no existe');
    });
  });
});
