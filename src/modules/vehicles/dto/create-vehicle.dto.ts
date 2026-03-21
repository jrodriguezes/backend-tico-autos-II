import {
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @IsNotEmpty()
  year: number;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsInt()
  @IsNotEmpty()
  mileage: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  observations: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(7)
  plateId: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}
