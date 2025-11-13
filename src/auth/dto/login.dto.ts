import { Matches, MinLength } from 'class-validator';

export class LoginDto {
  @Matches(/^\+?\d{6,15}$/)
  phone!: string;

  @MinLength(6)
  password!: string;
}
