import { Field, ObjectType, Int } from '@nestjs/graphql';
import { VehicleType } from './vehicle.type';

@ObjectType()
export class VehiclePageType {
  @Field(() => [VehicleType])
  data: VehicleType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}
