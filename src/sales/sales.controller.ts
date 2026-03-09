import {
  Controller,
  Get,
  Post,
  Body,
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
import { SaleCreator } from './services/sale-creator.service';
import { SaleFinder } from './services/sale-finder.service';
import { SaleDeleter } from './services/sale-deleter.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FilterSaleDto } from './dto/filter-sale.dto';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(
    private readonly saleCreator: SaleCreator,
    private readonly saleFinder: SaleFinder,
    private readonly saleDeleter: SaleDeleter,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar venta' })
  @ApiResponse({ status: 201, description: 'Venta registrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o precio menor al mínimo' })
  @ApiResponse({ status: 404, description: 'Consignación no encontrada' })
  @ApiResponse({ status: 409, description: 'La consignación ya tiene una venta' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleCreator.run(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  findAll(@Query() filterDto?: FilterSaleDto) {
    return this.saleFinder.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener venta por ID' })
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  findOne(@Param('id') id: string) {
    return this.saleFinder.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar venta (soft delete)' })
  @ApiResponse({ status: 204, description: 'Venta eliminada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  remove(@Param('id') id: string) {
    return this.saleDeleter.run(id);
  }
}
