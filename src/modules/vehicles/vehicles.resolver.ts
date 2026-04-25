import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { VehiclesService } from './vehicles.service';
import { VehicleType } from './graphql/vehicle.type';
import { VehicleFiltersInput } from './graphql/vehicle-filters.input';
import { VehiclePageType } from './graphql/vehicle-page.type';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException, UseGuards } from '@nestjs/common';

@Resolver(() => VehicleType)
export class VehiclesResolver {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Query(() => [VehicleType], { name: 'vehicles' })
  async getAllVehicles() {
    return this.vehiclesService.getAllVehicles();
  }

  @Query(() => VehicleType, { name: 'vehicle', nullable: true })
  async getVehicleByStringQueryId(@Args('id') vehicleId: string) {
    return this.vehiclesService.getVehicleByStringQueryId(vehicleId);
  }

  @Query(() => VehiclePageType, { name: 'filteredVehicles' })
  async getFilteredVehicles(
    @Args('filters', { type: () => VehicleFiltersInput, nullable: true })
    filters: VehicleFiltersInput,
  ) {
    return this.vehiclesService.getFilteredVehicles(filters);
  }

  @UseGuards(AuthGuard('jwt'))
  @Query(() => [VehicleType], { name: 'myVehicles' })
  async getMyVehicles(
    @Context() context: { req: { user: { numberId: number } } },
  ) {
    const user = context.req.user;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.vehiclesService.getAllVehiclesByOwnerId(user.numberId);
  }
}
