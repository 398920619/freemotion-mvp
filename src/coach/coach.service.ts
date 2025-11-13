import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchCoachDto } from './dto/search-coach.dto';
import { ApplyCoachDto } from './dto/apply-coach.dto';
import { UpdateCoachProfileDto } from './dto/update-coach-profile.dto';
import { OrderFilterDto } from '../order/dto/order-filter.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CoachService {
  constructor(private readonly prisma: PrismaService) {}

  async searchCoaches(query: SearchCoachDto) {
    const priceFilter =
      query.minPrice !== undefined || query.maxPrice !== undefined
        ? { gte: query.minPrice, lte: query.maxPrice }
        : undefined;
    return this.prisma.coachProfile.findMany({
      where: {
        isApproved: true,
        isActive: true,
        city: query.city ? { contains: query.city, mode: 'insensitive' } : undefined,
        skills: query.skills ? { contains: query.skills } : undefined,
        price: priceFilter,
      },
      include: { user: { select: { id: true, nickname: true } } },
      orderBy: { rating: 'desc' },
    });
  }

  async getCoachById(id: number) {
    const coach = await this.prisma.coachProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, nickname: true } } },
    });
    if (!coach) {
      throw new NotFoundException('Coach not found');
    }
    return coach;
  }

  async apply(userId: number, dto: ApplyCoachDto) {
    const existingProfile = await this.prisma.coachProfile.findUnique({ where: { userId } });
    if (existingProfile) {
      throw new BadRequestException('Coach profile already exists');
    }
    const profile = await this.prisma.coachProfile.create({
      data: {
        userId,
        city: dto.city,
        skills: dto.skills,
        price: dto.price,
        bio: dto.bio,
      },
    });
    await this.prisma.user.update({ where: { id: userId }, data: { role: UserRole.COACH } });
    return profile;
  }

  async getMyProfile(userId: number) {
    const profile = await this.prisma.coachProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    return profile;
  }

  async updateProfile(userId: number, dto: UpdateCoachProfileDto) {
    const profile = await this.prisma.coachProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    return this.prisma.coachProfile.update({ where: { id: profile.id }, data: dto });
  }

  async getCoachOrders(userId: number, filter: OrderFilterDto) {
    const profile = await this.prisma.coachProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    return this.prisma.order.findMany({
      where: { coachId: profile.id, status: filter.status },
      orderBy: { scheduledAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true, phone: true } },
      },
    });
  }
}
