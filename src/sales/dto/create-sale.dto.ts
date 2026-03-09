import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/sale.entity';

export class CreateSaleDto {
  @ApiProperty({ description: 'ID de la consignación' })
  @IsUUID()
  consignmentId: string;

  @ApiProperty({ description: 'Precio final de venta' })
  @IsNumber()
  @Min(0)
  sale_price: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Método de pago utilizado' })
  @IsEnum(PaymentMethod)
  payment_method_used: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Descripción del vehículo recibido en permuta (si aplica)',
  })
  @IsString()
  @IsOptional()
  trade_vehicle_description?: string;

  @ApiProperty({ description: 'Fecha de la venta (YYYY-MM-DD)' })
  @IsDateString()
  sale_date: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsString()
  @IsOptional()
  notes?: string;
}
