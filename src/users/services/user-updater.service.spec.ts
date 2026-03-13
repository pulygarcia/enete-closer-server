import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserUpdater } from './user-updater.service';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRole } from '../entities/user.entity';

describe('UserUpdater', () => {
  let service: UserUpdater;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const updateUserDto: UpdateUserDto = {
    name: 'Admin Actualizado',
  };

  beforeEach(async () => {
    const mockRepository = {
      preload: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUpdater,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserUpdater>(UserUpdater);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe actualizar un usuario exitosamente', async () => {
      const preloadedUser = { ...mockUser, ...updateUserDto };
      jest.spyOn(userRepository, 'preload').mockResolvedValue(preloadedUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(preloadedUser as User);

      const result = await service.run('user-1', updateUserDto);

      expect(userRepository.preload).toHaveBeenCalledWith({
        id: 'user-1',
        ...updateUserDto,
      });
      expect(userRepository.save).toHaveBeenCalledWith(preloadedUser);
      expect(result).toEqual(preloadedUser);
    });

    it('debe lanzar NotFoundException cuando el usuario no existe', async () => {
      jest.spyOn(userRepository, 'preload').mockResolvedValue(null as unknown as User);

      await expect(service.run('user-inexistente', updateUserDto)).rejects.toThrow(NotFoundException);
      await expect(service.run('user-inexistente', updateUserDto)).rejects.toThrow(
        'No se encontró el usuario con ID: user-inexistente',
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando el email ya existe en otro usuario', async () => {
      const dtoWithEmail: UpdateUserDto = { email: 'otro@example.com' };
      const preloadedUser = { ...mockUser, ...dtoWithEmail };
      jest.spyOn(userRepository, 'preload').mockResolvedValue(preloadedUser as User);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        id: 'user-2',
        email: 'otro@example.com',
      } as User);

      await expect(service.run('user-1', dtoWithEmail)).rejects.toThrow(ConflictException);
      await expect(service.run('user-1', dtoWithEmail)).rejects.toThrow(
        'Ya existe un usuario con ese email',
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('debe actualizar cuando el email no cambia (mismo usuario)', async () => {
      const dtoWithEmail: UpdateUserDto = { email: 'admin@example.com', name: 'Nuevo Nombre' };
      const preloadedUser = { ...mockUser, ...dtoWithEmail };
      jest.spyOn(userRepository, 'preload').mockResolvedValue(preloadedUser as User);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue(preloadedUser as User);

      const result = await service.run('user-1', dtoWithEmail);

      expect(result).toEqual(preloadedUser);
    });
  });
});
