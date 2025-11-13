import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCoachFilterDto } from './dto/admin-coach-filter.dto';
import { RejectCoachDto } from './dto/reject-coach.dto';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService, private readonly authService: AuthService) {}

  async login(dto: LoginDto) {
    const result = await this.authService.login(dto);
    if (result.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can login here');
    }
    return result;
  }

  async listCoaches(filter: AdminCoachFilterDto) {
    const isApproved = filter.isApproved !== undefined ? filter.isApproved === 'true' : undefined;
    return this.prisma.coachProfile.findMany({
      where: { isApproved },
      include: { user: { select: { id: true, phone: true, nickname: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveCoach(id: number) {
    const coach = await this.prisma.coachProfile.update({
      where: { id },
      data: { isApproved: true, isActive: true, reviewNote: null },
      include: { user: true },
    });
    return coach;
  }

  async rejectCoach(id: number, dto: RejectCoachDto) {
    const exists = await this.prisma.coachProfile.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Coach profile not found');
    }
    return this.prisma.coachProfile.update({
      where: { id },
      data: { isApproved: false, isActive: false, reviewNote: dto.reason },
    });
  }
}
