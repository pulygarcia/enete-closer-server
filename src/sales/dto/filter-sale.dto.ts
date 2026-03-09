import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/sale.entity';

export class FilterSaleDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID del vehículo' })
  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de la consignación' })
  @IsUUID()
  @IsOptional()
  consignmentId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por método de pago' })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Fecha desde (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  saleDateFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  saleDateTo?: string;
}
