import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConsignmentFinder } from './consignment-finder.service';
import { Consignment, CommissionType, ConsignmentStatus } from '../entities/consignment.entity';
import { FilterConsignmentDto } from '../dto/filter-consignment.dto';

describe('ConsignmentFinder', () => {
  let service: ConsignmentFinder;
  let consignmentRepository: any;

  const mockConsignments: Partial<Consignment>[] = [
    {
      id: 'uuid-consignment-1',
      agreed_min_price: 5000000,
      commission_type: CommissionType.FIXED,
      commission_value: 100000,
      status: ConsignmentStatus.ACTIVE,
      notes: '',
      intake_date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsignmentFinder,
        {
          provide: getRepositoryToken(Consignment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ConsignmentFinder>(ConsignmentFinder);
    consignmentRepository = module.get(getRepositoryToken(Consignment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar todas las consignaciones ordenadas por createdAt DESC', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockConsignments);

      const result = await service.findAll();

      expect(consignmentRepository.createQueryBuilder).toHaveBeenCalledWith('consignment');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('consignment.owner', 'owner');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('consignment.vehicle', 'vehicle');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('consignment.createdAt', 'DESC');
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual(mockConsignments);
    });

    it('debe aplicar filtros cuando se proporciona FilterConsignmentDto', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockConsignments);
      const filter: FilterConsignmentDto = {
        status: ConsignmentStatus.ACTIVE,
        ownerId: 'uuid-owner-1',
        vehicleId: 'uuid-vehicle-1',
      };

      await service.findAll(filter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('consignment.status = :status', {
        status: filter.status,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('owner.id = :ownerId', {
        ownerId: filter.ownerId,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('vehicle.id = :vehicleId', {
        vehicleId: filter.vehicleId,
      });
    });

    it('debe retornar array vacío cuando no hay consignaciones', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('debe retornar la consignación cuando existe', async () => {
      const consignment = mockConsignments[0];
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(consignment);

      const result = await service.findById('uuid-consignment-1');

      expect(consignmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-consignment-1' },
        relations: { owner: true, vehicle: true },
      });
      expect(result).toEqual(consignment);
    });

    it('debe lanzar NotFoundException cuando la consignación no existe', async () => {
      jest.spyOn(consignmentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('uuid-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.findById('uuid-inexistente')).rejects.toThrow('Consignación no encontrada');
    });
  });
});
