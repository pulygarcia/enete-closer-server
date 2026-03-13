import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OwnerCreator } from './owner-creator.service';
import { Owner } from '../entities/owner.entity';
import { CreateOwnerDto } from '../dto/create-owner.dto';

describe('OwnerCreator', () => {
  let service: OwnerCreator;
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

  const createOwnerDto: CreateOwnerDto = {
    fullName: 'Juan Pérez',
    phone: '+5491122334455',
    email: 'juan@example.com',
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn().mockReturnValue(mockOwner),
      save: jest.fn().mockResolvedValue(mockOwner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerCreator,
        {
          provide: getRepositoryToken(Owner),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OwnerCreator>(OwnerCreator);
    ownerRepository = module.get(getRepositoryToken(Owner));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe crear un dueño exitosamente cuando el teléfono no existe', async () => {
      jest.spyOn(ownerRepository, 'findOne').mockResolvedValue(null);

      const result = await service.run(createOwnerDto);

      expect(ownerRepository.findOne).toHaveBeenCalledWith({
        where: { phone: createOwnerDto.phone },
      });
      expect(ownerRepository.create).toHaveBeenCalledWith(createOwnerDto);
      expect(ownerRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockOwner);
    });

    it('debe lanzar ConflictException cuando ya existe un dueño con el mismo teléfono', async () => {
      jest.spyOn(ownerRepository, 'findOne').mockResolvedValue(mockOwner);

      await expect(service.run(createOwnerDto)).rejects.toThrow(ConflictException);
      await expect(service.run(createOwnerDto)).rejects.toThrow(
        'Ya existe un dueño con ese número de teléfono',
      );
      expect(ownerRepository.create).not.toHaveBeenCalled();
      expect(ownerRepository.save).not.toHaveBeenCalled();
    });
  });
});
