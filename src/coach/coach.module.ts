import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  providers: [CoachService, RolesGuard],
  controllers: [CoachController],
})
export class CoachModule {}
