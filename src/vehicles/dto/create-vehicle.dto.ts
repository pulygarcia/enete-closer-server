import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ArrayMaxSize, IsUUID, Min, IsBoolean } from 'class-validator';
import { Transmission } from '../entities/vehicle.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty() @IsString() brand: string;
  @ApiProperty() @IsString() model: string;
  @ApiProperty() @IsNumber() @Min(1900) year: number;
  @ApiProperty() @IsNumber() @Min(0) km: number;

  @ApiProperty({ enum: Transmission })
  @IsEnum(Transmission)
  transmission: Transmission;

  @ApiProperty() @IsNumber() @Min(0) owner_price: number;
  @ApiProperty() @IsNumber() @Min(0) list_price: number;
  
  @ApiProperty() @IsBoolean() @IsOptional() accepts_trade?: boolean;

  @ApiProperty({ type: [String], description: 'Máximo 3 URLs de Cloudinary' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(3)
  @IsOptional()
  images?: string[];

  @ApiProperty({ description: 'ID del dueño (UUID)' })
  @IsUUID()
  ownerId: string;
}
