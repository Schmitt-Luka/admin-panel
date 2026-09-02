import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

class SaleItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
