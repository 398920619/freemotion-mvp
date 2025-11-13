import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CoachService } from './coach.service';
import { SearchCoachDto } from './dto/search-coach.dto';
import { ApplyCoachDto } from './dto/apply-coach.dto';
import { UpdateCoachProfileDto } from './dto/update-coach-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { OrderFilterDto } from '../order/dto/order-filter.dto';

@Controller()
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('coaches')
  search(@Query() query: SearchCoachDto) {
    return this.coachService.searchCoaches(query);
  }

  @Get('coaches/:id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.coachService.getCoachById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.COACH)
  @Post('coach/apply')
  apply(@CurrentUser() user: JwtPayload, @Body() dto: ApplyCoachDto) {
    return this.coachService.apply(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  @Get('coach/profile')
  myProfile(@CurrentUser() user: JwtPayload) {
    return this.coachService.getMyProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  @Patch('coach/profile')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCoachProfileDto) {
    return this.coachService.updateProfile(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  @Get('coach/orders')
  getOrders(@CurrentUser() user: JwtPayload, @Query() filter: OrderFilterDto) {
    return this.coachService.getCoachOrders(user.sub, filter);
  }
}
