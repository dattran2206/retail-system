import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ModifierService } from '../services/modifier.service';
import { CreateModifierGroupDto, UpdateModifierGroupDto } from '../dto/modifier.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Modifiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/modifiers')
export class ModifierController {
  constructor(private readonly modifierService: ModifierService) {}

  @Get()
  @ApiOperation({ summary: 'Get all modifier groups' })
  findAllGroups() {
    return this.modifierService.findAllGroups();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get modifier group by ID' })
  findGroupById(@Param('id') id: string) {
    return this.modifierService.findGroupById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create modifier group with items' })
  @HttpCode(HttpStatus.CREATED)
  createGroup(@Body() dto: CreateModifierGroupDto) {
    return this.modifierService.createGroup(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update modifier group' })
  updateGroup(@Param('id') id: string, @Body() dto: UpdateModifierGroupDto) {
    return this.modifierService.updateGroup(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete modifier group' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteGroup(@Param('id') id: string) {
    return this.modifierService.deleteGroup(id);
  }

  @Post('assign/:productId/:modifierGroupId')
  @ApiOperation({ summary: 'Assign modifier group to a product' })
  @HttpCode(HttpStatus.CREATED)
  assignToProduct(
    @Param('productId') productId: string,
    @Param('modifierGroupId') modifierGroupId: string
  ) {
    return this.modifierService.assignToProduct(productId, modifierGroupId);
  }

  @Delete('assign/:productId/:modifierGroupId')
  @ApiOperation({ summary: 'Remove modifier group from a product' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromProduct(
    @Param('productId') productId: string,
    @Param('modifierGroupId') modifierGroupId: string
  ) {
    return this.modifierService.removeFromProduct(productId, modifierGroupId);
  }
}
