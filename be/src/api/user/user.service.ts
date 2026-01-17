import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JWT_CONFIG } from '../../configs/constant.config';
import { IPaginateParams } from '../../share/common/app.interface';
import { StringUtil } from '../../share/utils/string.util';
import { Between, Like, Repository } from 'typeorm';
import { RoleStatus, RoleTypes, RoleName } from '../role/role.constant';
import { ERROR_USER, UserStatus } from './user.constant';
import { UserEntity } from './user.entity';
import { IChangePassword } from './user.interface';
import { BaseService } from '../../share/database/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '../role/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ERROR_AUTH } from '../auth/auth.constant';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {
    super(userRepository);
  }

  // async onModuleInit() {
  //   console.log('UserService init');
  //   const userCount = await this.userRepository.count({});
  //   if (userCount === 0) {
  //     const uModel = new UserEntity();
  //     uModel.email = DEFAULT_ADMIN_USER.email;
  //     uModel.password = await bcrypt.hash(
  //       DEFAULT_ADMIN_USER.password,
  //       JWT_CONFIG.SALT_ROUNDS,
  //     );
  //     uModel.name = DEFAULT_ADMIN_USER.name;
  //     uModel.role = await this.roleRepository.findOneBy({
  //       type: RoleTypes.Admin,
  //       name: RoleName.Administrator,
  //     });
  //     await this.userRepository.save(uModel);
  //   }
  // }

  async getByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        email,
        role: {
          status: RoleStatus.ACTIVE,
        },
      },
      relations: ['role.permissions'],
    });
    if (!user) {
      throw new NotFoundException(ERROR_USER.USER_NOT_FOUND.MESSAGE);
    }
    return user;
  }

  async getByIdWithRoles(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions'],
    });
  }

  findUser(params: IPaginateParams) {
    const conditions: any = {};
    if (params.search) {
      conditions.name = Like(
        `%${StringUtil.mysqlRealEscapeString(params.search)}%`,
      );
    }
    if (params.status) {
      conditions.status = Number(params.status);
    }
    return this.getPagination(conditions, params, ['role']);
  }

  public async changePassword(
    id: string,
    paramsChangePassword: IChangePassword,
  ): Promise<boolean> {
    const userFound = await this.userRepository.findOneBy({ id });

    const { oldPassword, newPassword } = paramsChangePassword;
    const isRightPassword = bcrypt.compareSync(oldPassword, userFound.password);
    console.log('Compare result:', isRightPassword);
    if (!isRightPassword) {
      console.log('mật khẩu cũ', oldPassword);
      console.log('Mật khẩu tìm thấy', userFound.password);
      console.log('tên', userFound.name);
      throw new BadRequestException({
        message: ERROR_USER.USER_WRONG_OLD_PASSWORD.MESSAGE,
        code: ERROR_USER.USER_WRONG_OLD_PASSWORD.code,
      });
    }

    userFound.password = bcrypt.hashSync(newPassword, JWT_CONFIG.SALT_ROUNDS);
    userFound.save();

    return true;
  }

  async removeRefreshToken(userId: string): Promise<boolean> {
    await this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
    return true;
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        currentHashedRefreshToken: true,
      },
    });
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user?.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
    return null;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async createAdmin(data: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({
      email: data?.email?.toLowerCase(),
    });

    if (user) {
      throw new NotFoundException(ERROR_AUTH.USER_NAME_EXISTED.MESSAGE);
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      JWT_CONFIG.SALT_ROUNDS,
    );
    const role = await this.roleRepository.findOneBy({
      type: RoleTypes.Admin,
      status: RoleStatus.ACTIVE,
      name: RoleName.Administrator,
    });

    const uModel = new UserEntity();
    uModel.email = data.email.toLowerCase();
    uModel.password = passwordHash;
    uModel.name = data.name;
    uModel.role = role;
    if (data.phone) {
      uModel.phone = data.phone;
    }
    return this.userRepository.save(uModel);
  }

  async getNewCustomersCountInMonth(
    year?: number,
    month?: number,
  ): Promise<{ count: number; month: number; year: number }> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    // Tính ngày đầu và cuối tháng
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const count = await this.userRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
        status: UserStatus.ACTIVE,
      },
    });

    return {
      count,
      month: targetMonth,
      year: targetYear,
    };
  }
}
