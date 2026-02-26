import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOwnerDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;

  @ApiProperty({ example: '+5491122334455' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'juan@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Cliente muy cuidadoso con su auto', required: false })
  @IsString()
  @IsOptional()
  observation?: string;
}