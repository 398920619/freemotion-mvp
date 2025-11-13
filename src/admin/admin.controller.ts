import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AdminCoachFilterDto } from './dto/admin-coach-filter.dto';
import { RejectCoachDto } from './dto/reject-coach.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.adminService.login(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('coaches')
  list(@Query() filter: AdminCoachFilterDto) {
    return this.adminService.listCoaches(filter);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('coaches/:id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveCoach(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('coaches/:id/reject')
  reject(@Param('id', ParseIntPipe) id: number, @Body() dto: RejectCoachDto) {
    return this.adminService.rejectCoach(id, dto);
  }
}
