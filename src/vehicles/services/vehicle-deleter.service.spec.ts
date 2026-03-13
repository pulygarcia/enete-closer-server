import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VehicleDeleter } from './vehicle-deleter.service';
import { Vehicle } from '../entities/vehicle.entity';

describe('VehicleDeleter', () => {
  let service: VehicleDeleter;
  let vehicleRepository: jest.Mocked<Repository<Vehicle>>;

  beforeEach(async () => {
    const mockRepository = {
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleDeleter,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VehicleDeleter>(VehicleDeleter);
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe eliminar (soft delete) un vehículo exitosamente', async () => {
      jest
        .spyOn(vehicleRepository, 'softDelete')
        .mockResolvedValue({ affected: 1, raw: [] } as any);

      await service.run('uuid-vehicle-1');

      expect(vehicleRepository.softDelete).toHaveBeenCalledWith('uuid-vehicle-1');
    });

    it('debe lanzar NotFoundException cuando el vehículo no existe', async () => {
      jest
        .spyOn(vehicleRepository, 'softDelete')
        .mockResolvedValue({ affected: 0, raw: [] } as any);

      await expect(service.run('uuid-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.run('uuid-inexistente')).rejects.toThrow('El vehículo no existe');
    });
  });
});
