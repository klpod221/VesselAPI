import {
  Controller,
  Post,
  UseGuards,
  Get,
  Body,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { AuthenticatedRequest } from '../types/authenticated-request';
import { ApiResponse } from '../common/api-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const result = this.authService.createToken(user);
    return ApiResponse.ok(result);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(
      registerDto.email,
      registerDto.password,
    );
    return ApiResponse.ok(user, 'Registration successful');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest) {
    return ApiResponse.ok(req.user);
  }
}
