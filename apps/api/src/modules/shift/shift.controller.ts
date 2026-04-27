import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShiftService } from './shift.service';
import { OpenShiftDto, CloseShiftDto } from './dto/shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Shifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pos/shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get('current')
  @ApiOperation({ summary: 'Lấy ca làm việc hiện tại của thu ngân' })
  getCurrent(@Request() req: any) {
    return this.shiftService.getCurrentShift(req.user.id);
  }

  @Post('open')
  @ApiOperation({ summary: 'Mở ca làm việc mới' })
  open(@Request() req: any, @Body() dto: OpenShiftDto) {
    return this.shiftService.openShift(req.user.id, dto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Chốt ca làm việc' })
  close(@Request() req: any, @Param('id') id: string, @Body() dto: CloseShiftDto) {
    return this.shiftService.closeShift(req.user.id, id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lịch sử các ca làm việc' })
  findAll(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.shiftService.findAll(req.user.id, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một ca làm việc' })
  findOne(@Param('id') id: string) {
    return this.shiftService.findById(id);
  }
}
