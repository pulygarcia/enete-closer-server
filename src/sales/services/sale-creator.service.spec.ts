import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SaleCreator } from './sale-creator.service';
import { Sale, PaymentMethod } from '../entities/sale.entity';
import { Consignment, CommissionType, ConsignmentStatus } from '../../consignments/entities/consignment.entity';
import { Vehicle, VehicleStatus } from '../../vehicles/entities/vehicle.entity';
import { Owner } from '../../owners/entities/owner.entity';
import { CreateSaleDto } from '../dto/create-sale.dto';

describe('SaleCreator', () => {
  let service: SaleCreator;
  let saleRepository: jest.Mocked<Repository<Sale>>;
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

  const createSaleDto: CreateSaleDto = {
    consignmentId: 'uuid-consignment-1',
    sale_price: 5500000,
    payment_method_used: PaymentMethod.CASH,
    sale_date: '2024-02-01',
  };

  const mockSale: Partial<Sale> = {
    id: 'uuid-sale-1',
    vehicle: mockVehicle as Vehicle,
    consignment: mockConsignment as Consignment,
    sale_price: 5500000,
    payment_method_used: PaymentMethod.CASH,
    commission_earned: 100000,
    sale_date: new Date(),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockSaleRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
    };
    const mockConsignmentRepo = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const mockVehicleRepo = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleCreator,
        { provide: getRepositoryToken(Sale), useValue: mockSaleRepo },
        { provide: getRepositoryToken(Consignment), useValue: mockConsignmentRepo },
        { provide: getRepositoryToken(Vehicle), useValue: mockVehicleRepo },
      ],
    }).compile();

    service = module.get<SaleCreator>(SaleCreator);
    saleRepository = module.get(getRepositoryToken(Sale));
    consignmentRepository = module.get(getRepositoryToken(Consignment));
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe crear una venta exitosamente', async () => {
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(mockConsignment as Consignment);
      jest.spyOn(saleRepository, 'create').mockReturnValue(mockSale as Sale);
      jest.spyOn(saleRepository, 'save').mockResolvedValue(mockSale as Sale);
      jest.spyOn(saleRepository, 'findOneOrFail').mockResolvedValue(mockSale as Sale);

      const result = await service.run(createSaleDto);

      expect(consignmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: createSaleDto.consignmentId },
        relations: { owner: true, vehicle: true },
      });
      expect(saleRepository.create).toHaveBeenCalled();
      expect(saleRepository.save).toHaveBeenCalled();
      expect(vehicleRepository.update).toHaveBeenCalledWith('uuid-vehicle-1', {
        status: VehicleStatus.SOLD,
      });
      expect(consignmentRepository.update).toHaveBeenCalledWith(createSaleDto.consignmentId, {
        status: ConsignmentStatus.SOLD,
      });
      expect(result).toEqual(mockSale);
    });

    it('debe lanzar NotFoundException cuando la consignación no existe', async () => {
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.run(createSaleDto)).rejects.toThrow(NotFoundException);
      await expect(service.run(createSaleDto)).rejects.toThrow(
        'La consignación con ID uuid-consignment-1 no existe.',
      );
      expect(saleRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando la consignación ya está vendida', async () => {
      const soldConsignment = { ...mockConsignment, status: ConsignmentStatus.SOLD };
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(soldConsignment as Consignment);

      await expect(service.run(createSaleDto)).rejects.toThrow(ConflictException);
      await expect(service.run(createSaleDto)).rejects.toThrow(
        'Esta consignación ya tiene una venta registrada.',
      );
      expect(saleRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando la consignación está retirada', async () => {
      const withdrawnConsignment = { ...mockConsignment, status: ConsignmentStatus.WITHDRAWN };
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(withdrawnConsignment as Consignment);

      await expect(service.run(createSaleDto)).rejects.toThrow(BadRequestException);
      await expect(service.run(createSaleDto)).rejects.toThrow(
        'No se puede registrar venta en una consignación retirada.',
      );
      expect(saleRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando el precio es menor al mínimo acordado', async () => {
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(mockConsignment as Consignment);

      const dtoLowPrice: CreateSaleDto = {
        ...createSaleDto,
        sale_price: 4000000,
      };

      await expect(service.run(dtoLowPrice)).rejects.toThrow(BadRequestException);
      await expect(service.run(dtoLowPrice)).rejects.toThrow(
        'El precio de venta no puede ser menor al precio mínimo acordado (5000000).',
      );
      expect(saleRepository.save).not.toHaveBeenCalled();
    });
  });
});
