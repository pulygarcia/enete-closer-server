import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OwnerFinder } from './owner-finder.service';
import { Owner } from '../entities/owner.entity';

describe('OwnerFinder', () => {
  let service: OwnerFinder;
  let ownerRepository: jest.Mocked<Repository<Owner>>;

  const mockOwners: Owner[] = [
    {
      id: 'uuid-owner-1',
      fullName: 'Juan Pérez',
      phone: '+5491122334455',
      email: 'juan@example.com',
      observation: '',
      vehicles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerFinder,
        {
          provide: getRepositoryToken(Owner),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OwnerFinder>(OwnerFinder);
    ownerRepository = module.get(getRepositoryToken(Owner));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar todos los dueños ordenados por createdAt DESC', async () => {
      jest.spyOn(ownerRepository, 'find').mockResolvedValue(mockOwners);

      const result = await service.findAll();

      expect(ownerRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockOwners);
    });

    it('debe retornar array vacío cuando no hay dueños', async () => {
      jest.spyOn(ownerRepository, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('debe retornar el dueño cuando existe', async () => {
      const owner = mockOwners[0];
      jest.spyOn(ownerRepository, 'findOne').mockResolvedValue(owner);

      const result = await service.findById('uuid-owner-1');

      expect(ownerRepository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-owner-1' } });
      expect(result).toEqual(owner);
    });

    it('debe lanzar NotFoundException cuando el dueño no existe', async () => {
      jest.spyOn(ownerRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('uuid-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.findById('uuid-inexistente')).rejects.toThrow('Dueño no encontrado');
    });
  });
});
