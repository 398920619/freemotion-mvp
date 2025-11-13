import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @Matches(/^\+?\d{6,15}$/)
  phone!: string;

  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
