import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { AddressService } from './address.service';
import {
  CreateAddressDto,
  UpdateAddressDto,
  AddressResponseDto,
} from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { GetUser } from 'src/share/decorator/get-user.decorator';
import { API_CONFIG } from 'src/configs/constant.config';

@ApiTags('Addresses')
@ApiBearerAuth('access-token')
@Controller({
  version: [API_CONFIG.VERSION_V1],
  path: 'addresses',
})
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses of current user' })
  async findAll(@GetUser() user: UserEntity): Promise<AddressResponseDto[]> {
    return this.addressService.findByUserId(user.id) as Promise<
      AddressResponseDto[]
    >;
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default address of current user' })
  async getDefault(
    @GetUser() user: UserEntity,
  ): Promise<AddressResponseDto | null> {
    return this.addressService.getDefaultAddress(
      user.id,
    ) as Promise<AddressResponseDto | null>;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: UserEntity,
  ): Promise<AddressResponseDto> {
    return this.addressService.findOne(
      id,
      user.id,
    ) as Promise<AddressResponseDto>;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new address' })
  async create(
    @GetUser() user: UserEntity,
    @Body() createDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressService.create(
      user.id,
      createDto,
    ) as Promise<AddressResponseDto>;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  async update(
    @Param('id') id: string,
    @GetUser() user: UserEntity,
    @Body() updateDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressService.update(
      id,
      user.id,
      updateDto,
    ) as Promise<AddressResponseDto>;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete address' })
  async remove(
    @Param('id') id: string,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    return this.addressService.remove(id, user.id);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  async setAsDefault(
    @Param('id') id: string,
    @GetUser() user: UserEntity,
  ): Promise<AddressResponseDto> {
    return this.addressService.setAsDefault(
      id,
      user.id,
    ) as Promise<AddressResponseDto>;
  }
}
