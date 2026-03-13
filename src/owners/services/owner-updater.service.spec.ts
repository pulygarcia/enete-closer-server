import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OwnerUpdater } from './owner-updater.service';
import { Owner } from '../entities/owner.entity';
import { UpdateOwnerDto } from '../dto/update-owner.dto';

describe('OwnerUpdater', () => {
  let service: OwnerUpdater;
  let ownerRepository: jest.Mocked<Repository<Owner>>;

  const mockOwner: Owner = {
    id: 'uuid-owner-1',
    fullName: 'Juan Pérez',
    phone: '+5491122334455',
    email: 'juan@example.com',
    observation: '',
    vehicles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updateOwnerDto: UpdateOwnerDto = {
    fullName: 'Juan Pérez Actualizado',
  };

  beforeEach(async () => {
    const mockRepository = {
      preload: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerUpdater,
        {
          provide: getRepositoryToken(Owner),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OwnerUpdater>(OwnerUpdater);
    ownerRepository = module.get(getRepositoryToken(Owner));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe actualizar un dueño exitosamente', async () => {
      const preloadedOwner = { ...mockOwner, ...updateOwnerDto };
      jest.spyOn(ownerRepository, 'preload').mockResolvedValue(preloadedOwner);
      jest.spyOn(ownerRepository, 'save').mockResolvedValue(preloadedOwner);

      const result = await service.run('uuid-owner-1', updateOwnerDto);

      expect(ownerRepository.preload).toHaveBeenCalledWith({
        id: 'uuid-owner-1',
        ...updateOwnerDto,
      });
      expect(ownerRepository.save).toHaveBeenCalledWith(preloadedOwner);
      expect(result).toEqual(preloadedOwner);
    });

    it('debe lanzar NotFoundException cuando el dueño no existe', async () => {
      jest.spyOn(ownerRepository, 'preload').mockResolvedValue(null as unknown as Owner);

      await expect(service.run('uuid-inexistente', updateOwnerDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.run('uuid-inexistente', updateOwnerDto)).rejects.toThrow(
        'No se encontró el dueño con ID: uuid-inexistente',
      );
      expect(ownerRepository.save).not.toHaveBeenCalled();
    });
  });
});
