import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardFinderService } from './dashboard-finder.service';
import { Vehicle, VehicleStatus, VehicleCondition } from '../../vehicles/entities/vehicle.entity';
import { Sale, PaymentMethod } from '../../sales/entities/sale.entity';

describe('DashboardFinderService', () => {
  let service: DashboardFinderService;
  let vehicleRepository: any;
  let saleRepository: any;

  const now = new Date();

  const mockVehicles: Partial<Vehicle>[] = [
    {
      id: 'uuid-vehicle-1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      status: VehicleStatus.AVAILABLE,
      list_price: 5000000,
      images: [],
      condition: VehicleCondition.EXCELLENT,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'uuid-vehicle-2',
      brand: 'Honda',
      model: 'Civic',
      year: 2019,
      status: VehicleStatus.RESERVED,
      list_price: 4500000,
      images: [],
      condition: VehicleCondition.VERY_GOOD,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const mockSales: Partial<Sale>[] = [
    {
      id: 'uuid-sale-1',
      sale_price: 5000000,
      commission_earned: 150000,
      payment_method_used: PaymentMethod.CASH,
      createdAt: now,
    },
    {
      id: 'uuid-sale-2',
      sale_price: 4500000,
      commission_earned: 100000,
      payment_method_used: PaymentMethod.TRANSFER,
      createdAt: now,
    },
  ];

  beforeEach(async () => {
    const mockVehicleRepository = {
      count: jest.fn(),
      find: jest.fn(),
    };

    const mockSaleRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardFinderService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepository,
        },
        {
          provide: getRepositoryToken(Sale),
          useValue: mockSaleRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardFinderService>(DashboardFinderService);
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
    saleRepository = module.get(getRepositoryToken(Sale));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    beforeEach(() => {
      vehicleRepository.count
        .mockResolvedValueOnce(3)  // available
        .mockResolvedValueOnce(2); // reserved

      vehicleRepository.find
        .mockResolvedValueOnce(mockVehicles.slice(0, 5))  // recentVehicles
        .mockResolvedValueOnce(mockVehicles.slice(0, 5)); // stalledVehicles

      saleRepository.find
        .mockResolvedValueOnce(mockSales.slice(0, 5))  // recentSales
        .mockResolvedValueOnce(mockSales);              // monthlySales
    });

    it('debe retornar los contadores correctos', async () => {
      const result = await service.getStats();

      expect(result.counters.available).toBe(3);
      expect(result.counters.reserved).toBe(2);
      expect(result.counters.monthlySales).toBe(mockSales.length);
    });

    it('debe calcular correctamente las comisiones mensuales', async () => {
      const result = await service.getStats();

      const expectedCommissions = mockSales.reduce(
        (acc, sale) => acc + Number(sale.commission_earned),
        0,
      );
      expect(result.counters.monthlyCommissions).toBe(expectedCommissions);
    });

    it('debe retornar los vehículos recientes', async () => {
      const result = await service.getStats();

      expect(vehicleRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' },
          take: 5,
        }),
      );
      expect(result.recentVehicles).toEqual(mockVehicles.slice(0, 5));
    });

    it('debe retornar las ventas recientes con relación vehicle', async () => {
      const result = await service.getStats();

      expect(saleRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' },
          take: 5,
          relations: ['vehicle'],
        }),
      );
      expect(result.recentSales).toBeDefined();
    });

    it('debe consultar vehículos disponibles con count', async () => {
      await service.getStats();

      expect(vehicleRepository.count).toHaveBeenCalledWith({
        where: { status: VehicleStatus.AVAILABLE },
      });
    });

    it('debe consultar vehículos reservados con count', async () => {
      await service.getStats();

      expect(vehicleRepository.count).toHaveBeenCalledWith({
        where: { status: VehicleStatus.RESERVED },
      });
    });

    it('debe retornar comisiones en 0 cuando no hay ventas en el mes', async () => {
      vehicleRepository.count.mockReset();
      vehicleRepository.find.mockReset();
      saleRepository.find.mockReset();

      vehicleRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      vehicleRepository.find
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      saleRepository.find
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getStats();

      expect(result.counters.monthlySales).toBe(0);
      expect(result.counters.monthlyCommissions).toBe(0);
    });

    it('debe retornar la estructura completa del resultado', async () => {
      const result = await service.getStats();

      expect(result).toHaveProperty('counters');
      expect(result).toHaveProperty('recentVehicles');
      expect(result).toHaveProperty('recentSales');
      expect(result).toHaveProperty('stalledVehicles');
      expect(result.counters).toHaveProperty('available');
      expect(result.counters).toHaveProperty('reserved');
      expect(result.counters).toHaveProperty('monthlySales');
      expect(result.counters).toHaveProperty('monthlyCommissions');
    });
  });
});
