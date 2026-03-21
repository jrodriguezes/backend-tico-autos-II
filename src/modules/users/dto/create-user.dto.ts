import { IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsInt()
  @Min(1)
  numberId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}
