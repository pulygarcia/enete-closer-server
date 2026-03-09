import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UserFinder } from './services/user-finder.service';
import { UserUpdater } from './services/user-updater.service';
import { UserDeleter } from './services/user-deleter.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [ UserFinder, UserUpdater, UserDeleter],
  exports: [UserFinder],
})
export class UsersModule {}
