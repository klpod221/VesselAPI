import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO for user login.
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

/**
 * DTO for user registration.
 */
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
