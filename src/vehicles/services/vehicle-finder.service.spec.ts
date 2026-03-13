import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VehicleFinder } from './vehicle-finder.service';
import { Vehicle } from '../entities/vehicle.entity';

describe('VehicleFinder', () => {
  let service: VehicleFinder;
  let vehicleRepository: jest.Mocked<Repository<Vehicle>>;

  const mockVehicles = [
    {
      id: 'uuid-vehicle-1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      km: 50000,
      owner: { id: 'uuid-owner-1', fullName: 'Juan Pérez' },
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleFinder,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VehicleFinder>(VehicleFinder);
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar todos los vehículos sin filtro de marca', async () => {
      jest.spyOn(vehicleRepository, 'find').mockResolvedValue(mockVehicles as Vehicle[]);

      const result = await service.findAll();

      expect(vehicleRepository.find).toHaveBeenCalledWith({
        relations: { owner: true },
        where: {},
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockVehicles);
    });

    it('debe aplicar filtro por brand cuando se proporciona', async () => {
      jest.spyOn(vehicleRepository, 'find').mockResolvedValue(mockVehicles as Vehicle[]);

      await service.findAll('Toyota');

      expect(vehicleRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        }),
      );
    });
  });

  describe('findById', () => {
    it('debe retornar el vehículo cuando existe', async () => {
      const vehicle = mockVehicles[0] as Vehicle;
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(vehicle);

      const result = await service.findById('uuid-vehicle-1');

      expect(vehicleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-vehicle-1' },
        relations: { owner: true },
      });
      expect(result).toEqual(vehicle);
    });

    it('debe lanzar NotFoundException cuando el vehículo no existe', async () => {
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('uuid-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.findById('uuid-inexistente')).rejects.toThrow('Vehículo no encontrado');
    });
  });
});
