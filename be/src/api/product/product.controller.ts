// src/modules/product/product.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Thêm sản phẩm
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sản phẩm đã được tạo thành công',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ',
  })
  async themSanPham(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  // Lấy tất cả sản phẩm
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách tất cả sản phẩm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách sản phẩm',
  })
  async layTatCaSanPham() {
    return await this.productService.findAll();
  }

  // Tìm kiếm sản phẩm theo tên
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tìm kiếm sản phẩm theo tên' })
  @ApiQuery({
    name: 'keyword',
    required: true,
    description: 'Từ khóa tìm kiếm',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kết quả tìm kiếm',
  })
  async timKiem(@Query('keyword') keyword: string) {
    return await this.productService.search(keyword);
  }

  // Lọc sản phẩm
  @Get('filter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lọc sản phẩm theo điều kiện' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Giá tối thiểu' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Giá tối đa' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái' })
  @ApiQuery({
    name: 'inStock',
    required: false,
    description: 'Còn hàng (true/false)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kết quả lọc sản phẩm',
  })
  async locSanPham(
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('status') status?: number,
    @Query('inStock') inStock?: boolean,
  ) {
    return await this.productService.filter({
      minPrice,
      maxPrice,
      status,
      inStock,
    });
  }

  // Lấy chi tiết sản phẩm theo ID
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết sản phẩm',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sản phẩm',
  })
  async layChiTietSanPham(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.findOne(id);
  }

  // Sửa sản phẩm
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sản phẩm đã được cập nhật',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sản phẩm',
  })
  async suaSanPham(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto);
  }

  // Xóa sản phẩm
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sản phẩm đã được xóa',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sản phẩm',
  })
  async xoaSanPham(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.delete(id);
  }
}
