import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as schema from '../drizzle/schema';

type User = typeof schema.users.$inferSelect;
type SafeUser = Omit<User, 'password'>;

/**
 * Handles authentication logic: validation, JWT signing, registration.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate credentials and return user without password.
   * @returns SafeUser or null if invalid
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  /**
   * Create JWT token for authenticated user.
   */
  createToken(user: SafeUser) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Register a new user. Throws ConflictException if email exists.
   */
  async register(email: string, password: string): Promise<SafeUser> {
    const existing = await this.usersService.findOne(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser({
      email,
      password: hashedPassword,
      updatedAt: new Date(),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}
