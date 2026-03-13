import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VehicleUpdater } from './vehicle-updater.service';
import { Vehicle } from '../entities/vehicle.entity';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { Transmission } from '../entities/vehicle.entity';

describe('VehicleUpdater', () => {
  let service: VehicleUpdater;
  let vehicleRepository: jest.Mocked<Repository<Vehicle>>;

  const mockVehicle = {
    id: 'uuid-vehicle-1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    km: 50000,
    transmission: Transmission.MANUAL,
  };

  const updateVehicleDto: UpdateVehicleDto = {
    km: 55000,
  };

  beforeEach(async () => {
    const mockRepository = {
      preload: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleUpdater,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VehicleUpdater>(VehicleUpdater);
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe actualizar un vehículo exitosamente', async () => {
      const preloadedVehicle = { ...mockVehicle, ...updateVehicleDto };
      jest.spyOn(vehicleRepository, 'preload').mockResolvedValue(preloadedVehicle as Vehicle);
      jest.spyOn(vehicleRepository, 'save').mockResolvedValue(preloadedVehicle as Vehicle);

      const result = await service.run('uuid-vehicle-1', updateVehicleDto);

      expect(vehicleRepository.preload).toHaveBeenCalledWith({
        id: 'uuid-vehicle-1',
        ...updateVehicleDto,
      });
      expect(vehicleRepository.save).toHaveBeenCalledWith(preloadedVehicle);
      expect(result).toEqual(preloadedVehicle);
    });

    it('debe lanzar NotFoundException cuando el vehículo no existe', async () => {
      jest.spyOn(vehicleRepository, 'preload').mockResolvedValue(null as unknown as Vehicle);

      await expect(service.run('uuid-inexistente', updateVehicleDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.run('uuid-inexistente', updateVehicleDto)).rejects.toThrow(
        'No se encontró el vehículo para actualizar',
      );
      expect(vehicleRepository.save).not.toHaveBeenCalled();
    });
  });
});
