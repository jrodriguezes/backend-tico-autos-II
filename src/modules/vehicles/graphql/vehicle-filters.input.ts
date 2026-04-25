import { Field, InputType, Float, Int } from '@nestjs/graphql';

@InputType()
export class VehicleFiltersInput {
  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  model?: string;

  @Field(() => Int, { nullable: true })
  minYear?: number;

  @Field(() => Int, { nullable: true })
  maxYear?: number;

  @Field(() => Float, { nullable: true })
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  maxPrice?: number;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 8 })
  limit?: number;
}
