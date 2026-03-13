import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserFinder } from './user-finder.service';
import { User } from '../entities/user.entity';
import { FilterUserDto } from '../dto/filter-user.dto';
import { UserRole } from '../entities/user.entity';

describe('UserFinder', () => {
  let service: UserFinder;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockUsers = [
    {
      id: 'user-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserFinder,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserFinder>(UserFinder);
    userRepository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
    mockQueryBuilder.getMany.mockResolvedValue(mockUsers);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar todos los usuarios ordenados por createdAt', async () => {
      const result = await service.findAll();

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('debe aplicar filtro por role cuando se proporciona', async () => {
      const filter: FilterUserDto = { role: UserRole.ADMIN };
      await service.findAll(filter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', {
        role: UserRole.ADMIN,
      });
    });

    it('debe aplicar filtro por search cuando se proporciona', async () => {
      const filter: FilterUserDto = { search: 'admin' };
      await service.findAll(filter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: '%admin%' },
      );
    });
  });

  describe('findById', () => {
    it('debe retornar el usuario cuando existe', async () => {
      const user = mockUsers[0] as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findById('user-1');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toEqual(user);
    });

    it('debe lanzar NotFoundException cuando el usuario no existe', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('user-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.findById('user-inexistente')).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('findByEmail', () => {
    it('debe retornar el usuario cuando existe', async () => {
      const user = mockUsers[0] as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findByEmail('admin@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@example.com' },
      });
      expect(result).toEqual(user);
    });

    it('debe retornar null cuando el usuario no existe', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findByEmail('noexiste@example.com');

      expect(result).toBeNull();
    });
  });
});
