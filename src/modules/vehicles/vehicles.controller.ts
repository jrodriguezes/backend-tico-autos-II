import {
  Body,
  Controller,
  Post,
  Patch,
  Param,
  Get,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Delete,
  Query,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Types } from 'mongoose';
import { VehicleFiltersDto } from './dto/vehicle-filters.dto';

// Este tipo describe lo que JwtStrategy.validate() mete en req.user
type ReqUser = {
  userId: string; // viene de payload.sub (Mongo _id)
  numberId: number; // viene de payload.numberId (cedula)
  name: string;
};

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  getFilters(@Query() dto: VehicleFiltersDto) {
    return this.vehiclesService.getFilteredVehicles(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  getMine(@Req() req: { user: ReqUser }) {
    return this.vehiclesService.getAllVehiclesByOwnerId(req.user.numberId);
  }

  @Get('specification/:id')
  getSpecification(@Param('id') _id: string) {
    return this.vehiclesService.getVehicleByStringQueryId(_id);
  }

  @UseGuards(AuthGuard('jwt')) // Filtro de seguridad para que el usuario que hace la consulta sea verificado por JWT (busca el token dado por el frontend y lo valida)
  @Post()
  // Un interceptador es algo que puede meterse en medio de una request
  @UseInterceptors(
    // Interceptamos para procesar la imagen(image), que viene del frontend, con la clave image
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/vehicles',
        // Callback que se dispara cuando llega un archivo
        filename: (req, file, cb) => {
          // cb funcion de respuesta que multer necesita, extname sirve para sacar la extension del archivo original
          const name = `${Date.now()}_${file.originalname}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
    }),
  )
  create(
    @Req() req: { user: ReqUser },
    // Recibe el objeto del archivo que Multer guard en disco (req.file)
    // Uploadedfile lo que me da es el req.file
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateVehicleDto,
  ) {
    if (file) {
      dto.imageUrl = `/uploads/vehicles/${file.filename}`;
    }

    return this.vehiclesService.createVehicle(req.user.numberId, dto);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/vehicles',
        filename: (req, file, cb) => {
          const name = `${Date.now()}_${file.originalname}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
    }),
  )
  update(
    @Param('id') _id: string,
    @Body() dto: UpdateVehicleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.imageUrl = `/uploads/vehicles/${file.filename}`;
    }
    return this.vehiclesService.updateVehicle(_id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('changeStatus/:id')
  changeStatus(
    @Param('id') _id: Types.ObjectId,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.changeStatus(_id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id') _id: Types.ObjectId) {
    return this.vehiclesService.deleteVehicle(_id);
  }
}
