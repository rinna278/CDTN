// product.controller.ts
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { API_CONFIG } from '../../configs/constant.config';
import { ParamIdBaseDto } from '../../share/common/dto/query-param.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PermissionMetadata } from '../permission/permission.decorator';
import { PERMISSIONS } from '../permission/permission.constant';
import { PermissionGuard } from '../permission/permission.guard';
import { GetUser } from '../../share/decorator/get-user.decorator';
import { IAdminPayload } from '../../share/common/app.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ProductEntity } from './product.entity';
import { ProductService } from './product.service';
import { PRODUCT_SWAGGER_RESPONSE } from './product.constant';
import { QueryProductDto } from './dto/query-product.dto';

@Controller({
  version: [API_CONFIG.VERSION_V1],
  path: 'products',
})
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ========== PUBLIC ENDPOINTS ==========

  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm (có filter, search, phân trang)',
  })
  @ApiOkResponse(PRODUCT_SWAGGER_RESPONSE.GET_LIST_SUCCESS)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo ID' })
  @ApiOkResponse(PRODUCT_SWAGGER_RESPONSE.GET_SUCCESS)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  get(@Param() param: ParamIdBaseDto): Promise<ProductEntity> {
    return this.productService.get(param.id);
  }

  @ApiOperation({ summary: 'Lấy danh sách sản phẩm bán chạy' })
  @ApiOkResponse(PRODUCT_SWAGGER_RESPONSE.GET_LIST_SUCCESS)
  @Get('featured/best-sellers')
  @HttpCode(HttpStatus.OK)
  getBestSellers(@Query('limit') limit?: number): Promise<ProductEntity[]> {
    return this.productService.getBestSellers(limit);
  }

  @ApiOperation({ summary: 'Lấy danh sách sản phẩm mới nhất' })
  @ApiOkResponse(PRODUCT_SWAGGER_RESPONSE.GET_LIST_SUCCESS)
  @Get('featured/latest')
  @HttpCode(HttpStatus.OK)
  getLatestProducts(@Query('limit') limit?: number): Promise<ProductEntity[]> {
    return this.productService.getLatestProducts(limit);
  }

  @ApiOperation({ summary: 'Lấy danh sách sản phẩm đang giảm giá' })
  @ApiOkResponse(PRODUCT_SWAGGER_RESPONSE.GET_LIST_SUCCESS)
  @Get('featured/discount')
  @HttpCode(HttpStatus.OK)
  getDiscountProducts(
    @Query('limit') limit?: number,
  ): Promise<ProductEntity[]> {
    return this.productService.getDiscountProducts(limit);
  }

  @ApiOperation({ summary: 'Lấy danh sách categories' })
  @Get('meta/categories')
  @HttpCode(HttpStatus.OK)
  getCategories(): Promise<string[]> {
    return this.productService.getCategories();
  }

  @ApiOperation({ summary: 'Lấy danh sách màu sắc' })
  @Get('meta/colors')
  @HttpCode(HttpStatus.OK)
  getColors(): Promise<string[]> {
    return this.productService.getColors();
  }

  @ApiOperation({ summary: 'Lấy sản phẩm liên quan' })
  @Get(':id/related')
  @HttpCode(HttpStatus.OK)
  getRelatedProducts(
    @Param() param: ParamIdBaseDto,
    @Query('limit') limit?: number,
  ): Promise<ProductEntity[]> {
    return this.productService.getRelatedProducts(param.id, limit);
  }

  // ========== ADMIN ENDPOINTS (Require Authentication & Permission) ==========

  @ApiOperation({ summary: '[ADMIN] Tạo sản phẩm mới' })
  @ApiOkResponse(PRODUCT_SWAGGER_RESPONSE.CREATE_SUCCESS)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.PRODUCT_CREATE)
  create(
    @Body() createDto: CreateProductDto,
    @GetUser() user: IAdminPayload,
  ): Promise<ProductEntity> {
    return this.productService.createProduct(createDto, user.sub);
  }

  @ApiOperation({ summary: '[ADMIN] Cập nhật sản phẩm' })
  @ApiOkResponse(PRODUCT_SWAGGER_RESPONSE.UPDATE_SUCCESS)
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.PRODUCT_UPDATE)
  async update(
    @Param() param: ParamIdBaseDto,
    @Body() updateDto: UpdateProductDto,
    @GetUser() user: IAdminPayload,
  ): Promise<boolean> {
    return this.productService.updateProduct(param.id, updateDto, user.sub);
  }

  @ApiOperation({ summary: '[ADMIN] Xóa sản phẩm (soft delete)' })
  @ApiOkResponse(PRODUCT_SWAGGER_RESPONSE.DELETE_SUCCESS)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.PRODUCT_DELETE)
  remove(@Param() param: ParamIdBaseDto): Promise<boolean> {
    return this.productService.remove(param.id);
  }

  @ApiOperation({ summary: '[ADMIN] Cập nhật tồn kho' })
  @ApiOkResponse({ description: 'Update stock successfully' })
  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  updateStock(
    @Param() param: ParamIdBaseDto,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<ProductEntity> {
    return this.productService.updateStock(param.id, updateStockDto);
  }
}
