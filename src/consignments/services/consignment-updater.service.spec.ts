import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConsignmentUpdater } from './consignment-updater.service';
import { Consignment, CommissionType, ConsignmentStatus } from '../entities/consignment.entity';
import { UpdateConsignmentDto } from '../dto/update-consignment.dto';
import { Vehicle, VehicleStatus } from '../../vehicles/entities/vehicle.entity';
import { Owner } from '../../owners/entities/owner.entity';

describe('ConsignmentUpdater', () => {
  let service: ConsignmentUpdater;
  let consignmentRepository: jest.Mocked<Repository<Consignment>>;
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

  const mockConsignment: Consignment = {
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

  const updateConsignmentDto: UpdateConsignmentDto = {
    agreed_min_price: 5500000,
  };

  beforeEach(async () => {
    const mockConsignmentRepo = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      findOneOrFail: jest.fn(),
    };
    const mockVehicleRepo = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsignmentUpdater,
        { provide: getRepositoryToken(Consignment), useValue: mockConsignmentRepo },
        { provide: getRepositoryToken(Vehicle), useValue: mockVehicleRepo },
      ],
    }).compile();

    service = module.get<ConsignmentUpdater>(ConsignmentUpdater);
    consignmentRepository = module.get(getRepositoryToken(Consignment));
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe actualizar una consignación exitosamente', async () => {
      const updatedConsignment = { ...mockConsignment, agreed_min_price: 5500000 } as Consignment;
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(mockConsignment);
      jest.spyOn(consignmentRepository, 'findOneOrFail').mockResolvedValue(updatedConsignment);

      const result = await service.run('uuid-consignment-1', updateConsignmentDto);

      expect(consignmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-consignment-1' },
        relations: { owner: true, vehicle: true },
      });
      expect(consignmentRepository.update).toHaveBeenCalledWith('uuid-consignment-1', {
        agreed_min_price: 5500000,
      });
      expect(result).toEqual(updatedConsignment);
      expect(vehicleRepository.update).not.toHaveBeenCalled();
    });

    it('debe actualizar status a SOLD y el vehículo', async () => {
      const updatedConsignment = { ...mockConsignment, status: ConsignmentStatus.SOLD } as Consignment;
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(mockConsignment);
      jest.spyOn(consignmentRepository, 'findOneOrFail').mockResolvedValue(updatedConsignment);

      await service.run('uuid-consignment-1', { status: ConsignmentStatus.SOLD });

      expect(consignmentRepository.update).toHaveBeenCalledWith('uuid-consignment-1', expect.objectContaining({
        status: ConsignmentStatus.SOLD,
      }));
      expect(vehicleRepository.update).toHaveBeenCalledWith('uuid-vehicle-1', {
        status: VehicleStatus.SOLD,
      });
    });

    it('debe lanzar NotFoundException cuando la consignación no existe', async () => {
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.run('uuid-inexistente', updateConsignmentDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.run('uuid-inexistente', updateConsignmentDto)).rejects.toThrow(
        'Consignación no encontrada',
      );
      expect(consignmentRepository.update).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando el porcentaje de comisión supera 100', async () => {
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(mockConsignment);

      await expect(
        service.run('uuid-consignment-1', {
          commission_type: CommissionType.PERCENTAGE,
          commission_value: 150,
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.run('uuid-consignment-1', {
          commission_type: CommissionType.PERCENTAGE,
          commission_value: 150,
        }),
      ).rejects.toThrow('El porcentaje de comisión no puede superar 100.');
      expect(consignmentRepository.update).not.toHaveBeenCalled();
    });
  });
});
