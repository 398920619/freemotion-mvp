import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SearchCoachDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
