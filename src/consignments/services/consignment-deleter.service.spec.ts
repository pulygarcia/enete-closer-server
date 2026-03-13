import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConsignmentDeleter } from './consignment-deleter.service';
import { Consignment } from '../entities/consignment.entity';

describe('ConsignmentDeleter', () => {
  let service: ConsignmentDeleter;
  let consignmentRepository: jest.Mocked<Repository<Consignment>>;

  beforeEach(async () => {
    const mockRepository = {
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsignmentDeleter,
        {
          provide: getRepositoryToken(Consignment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ConsignmentDeleter>(ConsignmentDeleter);
    consignmentRepository = module.get(getRepositoryToken(Consignment));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe eliminar (soft delete) una consignación exitosamente', async () => {
      jest.spyOn(consignmentRepository, 'softDelete').mockResolvedValue({ affected: 1, raw: [] } as any);

      await service.run('uuid-consignment-1');

      expect(consignmentRepository.softDelete).toHaveBeenCalledWith('uuid-consignment-1');
    });

    it('debe lanzar NotFoundException cuando la consignación no existe', async () => {
      jest.spyOn(consignmentRepository, 'softDelete').mockResolvedValue({ affected: 0, raw: [] } as any);

      await expect(service.run('uuid-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.run('uuid-inexistente')).rejects.toThrow('La consignación no existe');
    });
  });
});
