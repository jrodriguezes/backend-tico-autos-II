import { IsString, IsNumber, IsOptional } from 'class-validator';

export class VehicleFiltersDto {
  @IsOptional()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  model: string;

  @IsOptional()
  @IsNumber()
  minYear: number;

  @IsOptional()
  @IsNumber()
  maxYear: number;

  @IsOptional()
  @IsNumber()
  minPrice: number;

  @IsOptional()
  @IsNumber()
  maxPrice: number;

  @IsOptional()
  @IsString()
  status: string;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;
}
