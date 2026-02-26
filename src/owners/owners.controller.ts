import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { OwnerCreator } from './services/owner-creator.service';
import { OwnerFinder } from './services/owner-finder.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OwnerUpdater } from './services/owner-updater.service';
import { OwnerDeleter } from './services/owner-deleter.service';

@ApiTags('Owners') //Agrupate in Swagger
@Controller('owners')
export class OwnersController {
  constructor(
    private readonly ownerCreator: OwnerCreator,
    private readonly ownerFinder: OwnerFinder,
    private readonly ownerUpdater: OwnerUpdater,
    private readonly ownerDeleter: OwnerDeleter,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo dueño' })
  create(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownerCreator.run(createOwnerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los dueños' })
  findAll() {
    return this.ownerFinder.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un dueño por ID' })
  findOne(@Param('id') id: string) {
    return this.ownerFinder.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un dueño por ID' })
  update(@Param('id') id: string, @Body() updateOwnerDto: UpdateOwnerDto) {
    return this.ownerUpdater.run(id, updateOwnerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un dueño por ID' })
  remove(@Param('id') id: string) {
    return this.ownerDeleter.run(id);
  }
}