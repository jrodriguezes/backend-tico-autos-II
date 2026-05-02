import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFiltersDto } from './dto/vehicle-filters.dto';

type TextFilter = {
  $regex: string;
  $options: 'i';
};

type RangeFilter = {
  $gte?: number;
  $lte?: number;
};

type VehicleQuery = {
  brand?: TextFilter;
  model?: TextFilter;
  year?: RangeFilter;
  price?: RangeFilter;
  status?: TextFilter;
};

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>,
  ) {}

  async createVehicle(userId: number, dto: CreateVehicleDto) {
    const createdVehicle = await this.vehicleModel.create({
      ownerId: userId, // se toma del token, no del body
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      price: dto.price,
      mileage: dto.mileage,
      status: dto.status,
      observations: dto.observations,
      plateId: dto.plateId,
      imageUrl: dto.imageUrl,
    });

    return createdVehicle;
  }

  async updateVehicle(_id: string, dto: UpdateVehicleDto) {
    const updatedVehicle = await this.vehicleModel.findByIdAndUpdate(
      _id,
      {
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        price: dto.price,
        mileage: dto.mileage,
        observations: dto.observations,
        plateId: dto.plateId,
        imageUrl: dto.imageUrl,
      },
      { returnDocument: 'after' }, // Retorna el documento actualizado;
    );

    if (!updatedVehicle) {
      throw new Error('Vehicle not found');
    }

    return {
      brand: updatedVehicle.brand,
      model: updatedVehicle.model,
      year: updatedVehicle.year,
      price: updatedVehicle.price,
      mileage: updatedVehicle.mileage,
      observations: updatedVehicle.observations,
      plateId: updatedVehicle.plateId,
      imageUrl: updatedVehicle.imageUrl,
      updatedAt: new Date(),
    };
  }

  async changeStatus(vehicleId: Types.ObjectId, dto: UpdateVehicleDto) {
    const updateVehicle = await this.vehicleModel.findByIdAndUpdate(vehicleId, {
      status: dto.status,
    });

    return updateVehicle;
  }

  async deleteVehicle(vehicleId: Types.ObjectId) {
    return await this.vehicleModel.deleteOne({ _id: vehicleId });
  }

  async getAllVehicles() {
    const vehicles = await this.vehicleModel.find();
    return vehicles;
  }

  async getAllVehiclesByOwnerId(numberId: number) {
    return await this.vehicleModel.find({ ownerId: numberId });
  }

  async getVehicleByStringQueryId(vehicleId: string) {
    return await this.vehicleModel.findById(vehicleId);
  }

  async getFilteredVehicles(dto: VehicleFiltersDto) {
    const query: VehicleQuery = {};

    if (dto.brand) {
      query.brand = { $regex: dto.brand, $options: 'i' }; // $regex operador de mongo para que busque coincidencia en la bd, $options = case-insensitve
    }

    if (dto.model) {
      query.model = { $regex: dto.model, $options: 'i' };
    }

    if (dto.minYear || dto.maxYear) {
      query.year = {};
      if (dto.minYear) {
        query.year.$gte = dto.minYear;
      }
      if (dto.maxYear) {
        query.year.$lte = dto.maxYear;
      }
    }

    if (dto.minPrice || dto.maxPrice) {
      query.price = {};
      if (dto.minPrice) {
        query.price.$gte = dto.minPrice;
      }
      if (dto.maxPrice) {
        query.price.$lte = dto.maxPrice;
      }
    }
    if (dto.status) {
      query.status = { $regex: dto.status, $options: 'i' };
    }

    const page = dto.page || 1;
    const limit = dto.limit || 8;
    const skip = (page - 1) * limit;

    const total = await this.vehicleModel.countDocuments(query);
    const data = await this.vehicleModel.find(query).skip(skip).limit(limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
