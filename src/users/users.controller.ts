import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserFinder } from './services/user-finder.service';
import { UserUpdater } from './services/user-updater.service';
import { UserDeleter } from './services/user-deleter.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly userFinder: UserFinder,
    private readonly userUpdater: UserUpdater,
    private readonly userDeleter: UserDeleter,
  ) {}

  //El create está hecho automaticamente por Better auth

  @Get()
  @ApiOperation({ summary: 'Listar usuarios con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAll(@Query() filterDto?: FilterUserDto) {
    return this.userFinder.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.userFinder.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userUpdater.run(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario (soft delete)' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id') id: string) {
    return this.userDeleter.run(id);
  }
}
