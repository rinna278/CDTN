import { ProductEntity } from '../product.entity';

export class ProductSearchResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  totalStock: number;
  category: string;
  images: any[];
  variants: any[];
  occasions: string[];
  status: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Thêm các field mới cho search
  nameHighlight?: string;
  descriptionHighlight?: string;

  constructor(product: ProductEntity, searchTerm?: string) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.discount = product.discount;
    this.totalStock = product.totalStock;
    this.category = product.category;
    this.images = product.images;
    this.variants = product.variants;
    this.occasions = product.occasions;
    this.status = product.status;
    this.soldCount = product.soldCount;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;

    // Nếu có search term thì highlight
    if (searchTerm) {
      this.nameHighlight = this.highlightText(product.name, searchTerm);
      this.descriptionHighlight = product.description
        ? this.highlightText(product.description, searchTerm)
        : null;
    }
  }

  private highlightText(text: string, searchTerm: string): string {
    if (!text || !searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}
