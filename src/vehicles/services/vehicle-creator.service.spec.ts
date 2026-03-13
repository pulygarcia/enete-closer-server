import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VehicleCreator } from './vehicle-creator.service';
import { Vehicle } from '../entities/vehicle.entity';
import { Owner } from '../../owners/entities/owner.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { Transmission } from '../entities/vehicle.entity';

describe('VehicleCreator', () => {
  let service: VehicleCreator;
  let vehicleRepository: jest.Mocked<Repository<Vehicle>>;
  let ownerRepository: jest.Mocked<Repository<Owner>>;

  const mockOwner = {
    id: 'uuid-owner-1',
    fullName: 'Juan Pérez',
    phone: '+5491122334455',
  };

  const mockVehicle = {
    id: 'uuid-vehicle-1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    km: 50000,
    transmission: Transmission.MANUAL,
    owner_price: 5000000,
    list_price: 5500000,
    owner: mockOwner,
  };

  const createVehicleDto: CreateVehicleDto = {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    km: 50000,
    transmission: Transmission.MANUAL,
    owner_price: 5000000,
    list_price: 5500000,
    ownerId: 'uuid-owner-1',
  };

  beforeEach(async () => {
    const mockVehicleRepo = {
      create: jest.fn().mockReturnValue(mockVehicle),
      save: jest.fn().mockResolvedValue(mockVehicle),
    };
    const mockOwnerRepo = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleCreator,
        { provide: getRepositoryToken(Vehicle), useValue: mockVehicleRepo },
        { provide: getRepositoryToken(Owner), useValue: mockOwnerRepo },
      ],
    }).compile();

    service = module.get<VehicleCreator>(VehicleCreator);
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
    ownerRepository = module.get(getRepositoryToken(Owner));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe crear un vehículo exitosamente', async () => {
      jest.spyOn(ownerRepository, 'findOneBy').mockResolvedValue(mockOwner as Owner);

      const result = await service.run(createVehicleDto);

      expect(ownerRepository.findOneBy).toHaveBeenCalledWith({ id: createVehicleDto.ownerId });
      expect(vehicleRepository.create).toHaveBeenCalledWith({
        ...createVehicleDto,
        owner: mockOwner,
      });
      expect(vehicleRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockVehicle);
    });

    it('debe lanzar NotFoundException cuando el dueño no existe', async () => {
      jest.spyOn(ownerRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.run(createVehicleDto)).rejects.toThrow(NotFoundException);
      await expect(service.run(createVehicleDto)).rejects.toThrow(
        `El dueño con ID ${createVehicleDto.ownerId} no existe.`,
      );
      expect(vehicleRepository.create).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando list_price es menor que owner_price', async () => {
      jest.spyOn(ownerRepository, 'findOneBy').mockResolvedValue(mockOwner as Owner);
      const dtoInvalid = { ...createVehicleDto, list_price: 4000000, owner_price: 5000000 };

      await expect(service.run(dtoInvalid)).rejects.toThrow(BadRequestException);
      await expect(service.run(dtoInvalid)).rejects.toThrow(
        'El precio de lista no puede ser menor al precio del dueño (comisión negativa)',
      );
      expect(vehicleRepository.save).not.toHaveBeenCalled();
    });
  });
});
