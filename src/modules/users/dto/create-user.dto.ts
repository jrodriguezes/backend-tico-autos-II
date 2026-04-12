import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsInt()
  @Min(1)
  numberId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  fLastName: string;

  @IsString()
  @IsOptional()
  sLastName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^\+506\d{8}$/, {
    message: 'El número debe venir en formato +50688887777',
  })
  phoneNumber: string;

  @IsString()
  @MinLength(6)
  password: string;
}
