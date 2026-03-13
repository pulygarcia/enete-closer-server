import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SaleFinder } from './sale-finder.service';
import { Sale, PaymentMethod } from '../entities/sale.entity';
import { FilterSaleDto } from '../dto/filter-sale.dto';

describe('SaleFinder', () => {
  let service: SaleFinder;
  let saleRepository: any;

  const mockSales: Partial<Sale>[] = [
    {
      id: 'uuid-sale-1',
      sale_price: 5500000,
      payment_method_used: PaymentMethod.CASH,
      commission_earned: 100000,
      sale_date: new Date(),
      createdAt: new Date(),
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
        SaleFinder,
        {
          provide: getRepositoryToken(Sale),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SaleFinder>(SaleFinder);
    saleRepository = module.get(getRepositoryToken(Sale));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar todas las ventas ordenadas por sale_date DESC', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockSales);

      const result = await service.findAll();

      expect(saleRepository.createQueryBuilder).toHaveBeenCalledWith('sale');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('sale.vehicle', 'vehicle');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('sale.consignment', 'consignment');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('sale.sale_date', 'DESC');
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual(mockSales);
    });

    it('debe aplicar filtros cuando se proporciona FilterSaleDto', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockSales);
      const filter: FilterSaleDto = {
        vehicleId: 'uuid-vehicle-1',
        consignmentId: 'uuid-consignment-1',
        paymentMethod: PaymentMethod.CASH,
        saleDateFrom: '2024-01-01',
        saleDateTo: '2024-12-31',
      };

      await service.findAll(filter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('vehicle.id = :vehicleId', {
        vehicleId: filter.vehicleId,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('consignment.id = :consignmentId', {
        consignmentId: filter.consignmentId,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('sale.payment_method_used = :paymentMethod', {
        paymentMethod: filter.paymentMethod,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('sale.sale_date >= :saleDateFrom', {
        saleDateFrom: filter.saleDateFrom,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('sale.sale_date <= :saleDateTo', {
        saleDateTo: filter.saleDateTo,
      });
    });

    it('debe retornar array vacío cuando no hay ventas', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('debe retornar la venta cuando existe', async () => {
      const sale = mockSales[0];
      jest.spyOn(saleRepository, 'findOne').mockResolvedValue(sale);

      const result = await service.findById('uuid-sale-1');

      expect(saleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-sale-1' },
        relations: { vehicle: true, consignment: { owner: true } },
      });
      expect(result).toEqual(sale);
    });

    it('debe lanzar NotFoundException cuando la venta no existe', async () => {
      jest.spyOn(saleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('uuid-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.findById('uuid-inexistente')).rejects.toThrow('Venta no encontrada');
    });
  });
});
