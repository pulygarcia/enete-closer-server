import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConsignmentCreator } from './consignment-creator.service';
import { Consignment, CommissionType, ConsignmentStatus } from '../entities/consignment.entity';
import { Owner } from '../../owners/entities/owner.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { CreateConsignmentDto } from '../dto/create-consignment.dto';
import { VehicleStatus } from '../../vehicles/entities/vehicle.entity';

describe('ConsignmentCreator', () => {
  let service: ConsignmentCreator;
  let consignmentRepository: jest.Mocked<Repository<Consignment>>;
  let ownerRepository: jest.Mocked<Repository<Owner>>;
  let vehicleRepository: jest.Mocked<Repository<Vehicle>>;

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

  const mockVehicle: Partial<Vehicle> = {
    id: 'uuid-vehicle-1',
    owner: mockOwner,
  };

  const mockConsignment: Partial<Consignment> = {
    id: 'uuid-consignment-1',
    owner: mockOwner,
    vehicle: mockVehicle as Vehicle,
    agreed_min_price: 5000000,
    commission_type: CommissionType.FIXED,
    commission_value: 100000,
    status: ConsignmentStatus.ACTIVE,
    notes: '',
    intake_date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createConsignmentDto: CreateConsignmentDto = {
    ownerId: 'uuid-owner-1',
    vehicleId: 'uuid-vehicle-1',
    agreed_min_price: 5000000,
    commission_type: CommissionType.FIXED,
    commission_value: 100000,
    intake_date: '2024-01-15',
  };

  beforeEach(async () => {
    const mockConsignmentRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    const mockOwnerRepo = {
      findOneBy: jest.fn(),
    };
    const mockVehicleRepo = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsignmentCreator,
        { provide: getRepositoryToken(Consignment), useValue: mockConsignmentRepo },
        { provide: getRepositoryToken(Owner), useValue: mockOwnerRepo },
        { provide: getRepositoryToken(Vehicle), useValue: mockVehicleRepo },
      ],
    }).compile();

    service = module.get<ConsignmentCreator>(ConsignmentCreator);
    consignmentRepository = module.get(getRepositoryToken(Consignment));
    ownerRepository = module.get(getRepositoryToken(Owner));
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe crear una consignación exitosamente', async () => {
      jest.spyOn(ownerRepository, 'findOneBy').mockResolvedValue(mockOwner);
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(mockVehicle as Vehicle);
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(consignmentRepository, 'create').mockReturnValue(mockConsignment as Consignment);
      jest.spyOn(consignmentRepository, 'save').mockResolvedValue(mockConsignment as Consignment);

      await service.run(createConsignmentDto);

      expect(ownerRepository.findOneBy).toHaveBeenCalledWith({ id: createConsignmentDto.ownerId });
      expect(vehicleRepository.findOne).toHaveBeenCalledWith({
        where: { id: createConsignmentDto.vehicleId },
        relations: { owner: true },
      });
      expect(consignmentRepository.findOne).toHaveBeenCalledWith({
        where: { vehicle: { id: createConsignmentDto.vehicleId } },
      });
      expect(consignmentRepository.create).toHaveBeenCalled();
      expect(consignmentRepository.save).toHaveBeenCalled();
      expect(vehicleRepository.update).toHaveBeenCalledWith(createConsignmentDto.vehicleId, {
        status: VehicleStatus.AVAILABLE,
      });
    });

    it('debe lanzar NotFoundException cuando el dueño no existe', async () => {
      jest.spyOn(ownerRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.run(createConsignmentDto)).rejects.toThrow(NotFoundException);
      await expect(service.run(createConsignmentDto)).rejects.toThrow(
        'El dueño con ID uuid-owner-1 no existe.',
      );
      expect(consignmentRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException cuando el vehículo no existe', async () => {
      jest.spyOn(ownerRepository, 'findOneBy').mockResolvedValue(mockOwner);
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.run(createConsignmentDto)).rejects.toThrow(NotFoundException);
      await expect(service.run(createConsignmentDto)).rejects.toThrow(
        'El vehículo con ID uuid-vehicle-1 no existe.',
      );
      expect(consignmentRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando el vehículo no pertenece al dueño', async () => {
      const otherOwner = { ...mockOwner, id: 'uuid-owner-2' };
      jest.spyOn(ownerRepository, 'findOneBy').mockResolvedValue(mockOwner);
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue({
        ...mockVehicle,
        owner: otherOwner,
      } as Vehicle);

      await expect(service.run(createConsignmentDto)).rejects.toThrow(BadRequestException);
      await expect(service.run(createConsignmentDto)).rejects.toThrow(
        'El vehículo no pertenece al dueño indicado.',
      );
      expect(consignmentRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando ya existe consignación activa', async () => {
      jest.spyOn(ownerRepository, 'findOneBy').mockResolvedValue(mockOwner);
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(mockVehicle as Vehicle);
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(mockConsignment as Consignment);

      await expect(service.run(createConsignmentDto)).rejects.toThrow(ConflictException);
      await expect(service.run(createConsignmentDto)).rejects.toThrow(
        'Este vehículo ya tiene una consignación activa.',
      );
      expect(consignmentRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando el porcentaje de comisión supera 100', async () => {
      const dtoWithPercentage: CreateConsignmentDto = {
        ...createConsignmentDto,
        commission_type: CommissionType.PERCENTAGE,
        commission_value: 150,
      };
      jest.spyOn(ownerRepository, 'findOneBy').mockResolvedValue(mockOwner);
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(mockVehicle as Vehicle);
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.run(dtoWithPercentage)).rejects.toThrow(BadRequestException);
      await expect(service.run(dtoWithPercentage)).rejects.toThrow(
        'El porcentaje de comisión no puede superar 100.',
      );
      expect(consignmentRepository.save).not.toHaveBeenCalled();
    });
  });
});
