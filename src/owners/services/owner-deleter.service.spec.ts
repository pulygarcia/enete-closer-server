import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OwnerDeleter } from './owner-deleter.service';
import { Owner } from '../entities/owner.entity';

describe('OwnerDeleter', () => {
  let service: OwnerDeleter;
  let ownerRepository: jest.Mocked<Repository<Owner>>;

  beforeEach(async () => {
    const mockRepository = {
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerDeleter,
        {
          provide: getRepositoryToken(Owner),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OwnerDeleter>(OwnerDeleter);
    ownerRepository = module.get(getRepositoryToken(Owner));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe eliminar (soft delete) un dueño exitosamente', async () => {
      jest.spyOn(ownerRepository, 'softDelete').mockResolvedValue({ affected: 1, raw: [] } as any);

      await service.run('uuid-owner-1');

      expect(ownerRepository.softDelete).toHaveBeenCalledWith('uuid-owner-1');
    });

    it('debe lanzar NotFoundException cuando el dueño no existe', async () => {
      jest.spyOn(ownerRepository, 'softDelete').mockResolvedValue({ affected: 0, raw: [] } as any);

      await expect(service.run('uuid-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.run('uuid-inexistente')).rejects.toThrow(
        'No se pudo eliminar: Dueño con ID uuid-inexistente no encontrado',
      );
    });
  });
});
