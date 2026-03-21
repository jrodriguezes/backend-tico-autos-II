import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':id')
  findByIdWithHash(@Param('id') numberId: number) {
    return this.usersService.findByIdWithHash(numberId);
  }

  @Get('userNameById/:id')
  getUserNameById(@Param('id') userId: number) {
    return this.usersService.getOwnerNameByOwnerId(userId);
  }
}
