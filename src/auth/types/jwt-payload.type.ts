import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  phone: string;
  role: UserRole;
}
