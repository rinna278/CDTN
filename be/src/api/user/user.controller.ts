import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { API_CONFIG } from '../../configs/constant.config';
import { IAdminPayload } from '../../share/common/app.interface';
import { GetUser } from '../../share/decorator/get-user.decorator';
import { ParamIdBaseDto } from '../../share/common/dto/query-param.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PermissionMetadata } from '../permission/permission.decorator';
import { PERMISSIONS } from '../permission/permission.constant';
import { PermissionGuard } from '../permission/permission.guard';
import { QueryParamDto } from './dto/query-param.dto';
import { ChangeUserPasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { USER_SWAGGER_RESPONSE } from './user.constant';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller({
  version: [API_CONFIG.VERSION_V1],
  path: 'users',
})
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse(USER_SWAGGER_RESPONSE.GET_LIST_SUCCESS)
  @Get('info')
  @HttpCode(HttpStatus.OK)
  public getByEmail(@GetUser('email') email: string): Promise<UserEntity> {
    return this.userService.getByEmail(email);
  }

  @ApiOkResponse(USER_SWAGGER_RESPONSE.UPDATE_SUCCESS)
  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(
    @GetUser() user: IAdminPayload,
    @Body() body: ChangeUserPasswordDto,
  ) {
    console.log('user.sub', user.sub);
    return this.userService.changePassword(user.sub, body);
  }

  @ApiOkResponse(USER_SWAGGER_RESPONSE.UPDATE_SUCCESS)
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @PermissionMetadata(PERMISSIONS.USER_UPDATE)
  @UseGuards(PermissionGuard)
  public async update(
    @Param() param: ParamIdBaseDto,
    @Body() updateDto: UpdateUserDto,
  ): Promise<boolean> {
    await this.userService.update(param.id, updateDto);
    return true;
  }

  @ApiOkResponse(USER_SWAGGER_RESPONSE.GET_LIST_SUCCESS)
  @Get()
  @HttpCode(HttpStatus.OK)
  @PermissionMetadata(PERMISSIONS.USER_GET_ALL)
  @UseGuards(PermissionGuard)
  public findUser(@Query() query: QueryParamDto): Promise<any> {
    return this.userService.findUser(query);
  }

  // @ApiOkResponse(USER_SWAGGER_RESPONSE.CREATE_SUCCESS)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  createUser(@Body() body: CreateUserDto) {
    return this.userService.createAdmin(body);
  }

  @ApiOkResponse(USER_SWAGGER_RESPONSE.GET_SUCCESS)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @PermissionMetadata(PERMISSIONS.USER_READ)
  public get(@Param() param: ParamIdBaseDto): Promise<UserEntity> {
    return this.userService.get(param.id);
  }
}
