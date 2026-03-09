import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConsignmentStatus } from '../entities/consignment.entity';

export class FilterConsignmentDto {
  @ApiPropertyOptional({ enum: ConsignmentStatus })
  @IsEnum(ConsignmentStatus)
  @IsOptional()
  status?: ConsignmentStatus;

  @ApiPropertyOptional({ description: 'Filtrar por ID del dueño' })
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID del vehículo' })
  @IsUUID()
  @IsOptional()
  vehicleId?: string;
}
