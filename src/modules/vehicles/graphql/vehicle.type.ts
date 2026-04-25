import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';

@ObjectType()
export class VehicleType {
  @Field(() => ID)
  _id: string;

  @Field(() => Int)
  ownerId: number;

  @Field()
  brand: string;

  @Field()
  model: string;

  @Field()
  year: number;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  mileage: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  observations?: string;

  @Field()
  plateId: string;

  @Field({ nullable: true })
  imageUrl?: string;
}
