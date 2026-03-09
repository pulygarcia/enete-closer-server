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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConsignmentCreator } from './services/consignment-creator.service';
import { ConsignmentFinder } from './services/consignment-finder.service';
import { ConsignmentUpdater } from './services/consignment-updater.service';
import { ConsignmentDeleter } from './services/consignment-deleter.service';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';
import { FilterConsignmentDto } from './dto/filter-consignment.dto';

@ApiTags('Consignments')
@ApiBearerAuth()
@Controller('consignments')
export class ConsignmentsController {
  constructor(
    private readonly consignmentCreator: ConsignmentCreator,
    private readonly consignmentFinder: ConsignmentFinder,
    private readonly consignmentUpdater: ConsignmentUpdater,
    private readonly consignmentDeleter: ConsignmentDeleter,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear consignación' })
  @ApiResponse({ status: 201, description: 'Consignación creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Dueño o vehículo no encontrado' })
  create(@Body() createConsignmentDto: CreateConsignmentDto) {
    return this.consignmentCreator.run(createConsignmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar consignaciones con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de consignaciones' })
  findAll(@Query() filterDto?: FilterConsignmentDto) {
    return this.consignmentFinder.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener consignación por ID' })
  @ApiResponse({ status: 200, description: 'Consignación encontrada' })
  @ApiResponse({ status: 404, description: 'Consignación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.consignmentFinder.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar consignación' })
  @ApiResponse({ status: 200, description: 'Consignación actualizada' })
  @ApiResponse({ status: 404, description: 'Consignación no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateConsignmentDto: UpdateConsignmentDto,
  ) {
    return this.consignmentUpdater.run(id, updateConsignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar consignación (soft delete)' })
  @ApiResponse({ status: 204, description: 'Consignación eliminada' })
  @ApiResponse({ status: 404, description: 'Consignación no encontrada' })
  remove(@Param('id') id: string) {
    return this.consignmentDeleter.run(id);
  }
}
