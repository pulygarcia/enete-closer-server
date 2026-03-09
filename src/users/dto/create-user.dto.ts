import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../entities/user.entity";

export class CreateUserDto {
  @ApiProperty({ example: "María García" })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: "maria@example.com" })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: "https://example.com/avatar.png", required: false })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  image?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.VIEWER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
