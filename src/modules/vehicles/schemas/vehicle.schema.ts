import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Vehicle {
  @Prop({ required: true })
  ownerId: number;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  mileage: number;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  observations: string;

  @Prop({ required: true })
  plateId: string;

  @Prop({ required: true })
  imageUrl: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
