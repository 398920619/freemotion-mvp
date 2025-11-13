import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ApplyCoachDto {
  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsNotEmpty()
  @IsString()
  skills!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  bio?: string;
}
