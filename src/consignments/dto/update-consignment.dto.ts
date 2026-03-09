import { PartialType } from '@nestjs/swagger';
import { CreateConsignmentDto } from './create-consignment.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConsignmentStatus } from '../entities/consignment.entity';

export class UpdateConsignmentDto extends PartialType(CreateConsignmentDto) {
  @ApiPropertyOptional({ enum: ConsignmentStatus })
  @IsEnum(ConsignmentStatus)
  @IsOptional()
  status?: ConsignmentStatus;
}
