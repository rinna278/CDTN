import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from './address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private addressRepository: Repository<AddressEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Create new address for user
   */
  async create(
    userId: string,
    createDto: CreateAddressDto,
  ): Promise<AddressEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Nếu isDefault=true, set các addresses khác thành false
    if (createDto.isDefault) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    const address = this.addressRepository.create({
      ...createDto,
      userId,
    });

    return this.addressRepository.save(address);
  }

  /**
   * Get all addresses of user
   */
  async findByUserId(userId: string): Promise<AddressEntity[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Get default address of user
   */
  async getDefaultAddress(userId: string): Promise<AddressEntity | null> {
    return this.addressRepository.findOne({
      where: { userId, isDefault: true },
    });
  }

  /**
   * Get address by ID
   */
  async findOne(addressId: string, userId: string): Promise<AddressEntity> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  /**
   * Update address
   */
  async update(
    addressId: string,
    userId: string,
    updateDto: UpdateAddressDto,
  ): Promise<AddressEntity> {
    const address = await this.findOne(addressId, userId);

    // Nếu set isDefault=true, set các addresses khác thành false
    if (updateDto.isDefault) {
      await this.addressRepository.update(
        { userId, id: { $ne: addressId } as any },
        { isDefault: false },
      );
    }

    Object.assign(address, updateDto);
    return this.addressRepository.save(address);
  }

  /**
   * Delete address
   */
  async remove(addressId: string, userId: string): Promise<void> {
    const address = await this.findOne(addressId, userId);

    // Nếu xóa địa chỉ mặc định, set địa chỉ khác thành mặc định
    if (address.isDefault) {
      const anotherAddress = await this.addressRepository.findOne({
        where: { userId, id: { $ne: addressId } as any },
        order: { createdAt: 'DESC' },
      });

      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await this.addressRepository.save(anotherAddress);
      }
    }

    await this.addressRepository.remove(address);
  }

  /**
   * Set address as default
   */
  async setAsDefault(
    addressId: string,
    userId: string,
  ): Promise<AddressEntity> {
    const address = await this.findOne(addressId, userId);

    // Set tất cả addresses khác thành false
    await this.addressRepository.update(
      { userId, id: { $ne: addressId } as any },
      { isDefault: false },
    );

    address.isDefault = true;
    return this.addressRepository.save(address);
  }
}
