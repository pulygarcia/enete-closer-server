import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserDeleter } from './user-deleter.service';
import { User } from '../entities/user.entity';

describe('UserDeleter', () => {
  let service: UserDeleter;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockRepository = {
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDeleter,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserDeleter>(UserDeleter);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('debe eliminar un usuario exitosamente', async () => {
      jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1, raw: [] } as any);

      await service.run('user-1');

      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    });

    it('debe lanzar NotFoundException cuando el usuario no existe', async () => {
      jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 0, raw: [] } as any);

      await expect(service.run('user-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.run('user-inexistente')).rejects.toThrow(
        'El usuario no existe o no fue encontrado',
      );
    });
  });
});
