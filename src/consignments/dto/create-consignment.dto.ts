import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommissionType } from '../entities/consignment.entity';

export class CreateConsignmentDto {
  @ApiProperty({ description: 'ID del dueño (Owner)' })
  @IsUUID()
  ownerId: string;

  @ApiProperty({ description: 'ID del vehículo a consignar' })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ description: 'Precio mínimo acordado con el dueño' })
  @IsNumber()
  @Min(0)
  agreed_min_price: number;

  @ApiProperty({ enum: CommissionType, description: 'Tipo de comisión: fija o porcentaje' })
  @IsEnum(CommissionType)
  commission_type: CommissionType;

  @ApiProperty({
    description:
      'Valor de comisión: monto fijo o porcentaje (0-100) según commission_type',
  })
  @IsNumber()
  @Min(0)
  commission_value: number;

  @ApiPropertyOptional({ description: 'Notas del acuerdo' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Fecha de ingreso del vehículo (YYYY-MM-DD)' })
  @IsDateString()
  intake_date: string;
}
