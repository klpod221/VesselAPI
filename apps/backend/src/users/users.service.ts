import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOne(email: string) {
    const result = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
    return result || null;
  }

  async createUser(data: typeof schema.users.$inferInsert) {
    const result = await this.db.insert(schema.users).values(data).returning();
    return result[0];
  }
}
