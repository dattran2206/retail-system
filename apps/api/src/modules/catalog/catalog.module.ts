import { Module } from '@nestjs/common';
import { CategoryController } from './controllers/category.controller';
import { ProductController } from './controllers/product.controller';
import { VariantController } from './controllers/variant.controller';
import { UnitConversionController } from './controllers/unit-conversion.controller';
import { CategoryService } from './services/category.service';
import { ProductService } from './services/product.service';
import { VariantService } from './services/variant.service';
import { UnitConversionService } from './services/unit-conversion.service';
import { ModifierController } from './controllers/modifier.controller';
import { ModifierService } from './services/modifier.service';
import { TableController } from './controllers/table.controller';
import { TableService } from './services/table.service';

@Module({
  controllers: [
    CategoryController,
    ProductController,
    VariantController,
    UnitConversionController,
    ModifierController,
    TableController
  ],
  providers: [
    CategoryService,
    ProductService,
    VariantService,
    UnitConversionService,
    ModifierService,
    TableService
  ],
  exports: [TableService]
})
export class CatalogModule {}
