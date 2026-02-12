import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { SyncCollectionDto } from './dto/collection.dto';

type CollectionRow = typeof schema.collections.$inferSelect;

/**
 * Handles collection CRUD and sync operations with the database.
 */
@Injectable()
export class CollectionsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Upsert a collection row directly.
   */
  async syncCollection(
    userId: string,
    data: Omit<typeof schema.collections.$inferInsert, 'userId'>,
  ): Promise<CollectionRow[]> {
    return this.db
      .insert(schema.collections)
      .values({
        ...data,
        userId,
        syncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.collections.id,
        set: {
          name: data.name,
          description: data.description,
          version: data.version,
          content: data.content,
          isDeleted: data.isDeleted,
          updatedAt: data.updatedAt,
          syncedAt: new Date(),
        },
      })
      .returning();
  }

  /**
   * Sync a collection from the client DTO format.
   * Transforms the flat requests/folders/variables into a JSON `content` column.
   */
  async syncFromDto(
    userId: string,
    dto: SyncCollectionDto,
  ): Promise<CollectionRow[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { requests, folders, variables, isSynced, ...meta } = dto;

    const content = {
      requests: requests ?? [],
      folders: folders ?? [],
      variables: variables ?? [],
    };

    return this.syncCollection(userId, {
      ...meta,
      content,
      isDeleted: false,
      updatedAt: meta.updatedAt ? new Date(meta.updatedAt) : new Date(),
      syncedAt: new Date(),
    });
  }

  /**
   * Get all non-deleted collections for a user.
   * Expands the JSON `content` column into top-level fields.
   */
  async getUserCollections(userId: string) {
    const rows = await this.db.query.collections.findMany({
      where: and(
        eq(schema.collections.userId, userId),
        eq(schema.collections.isDeleted, false),
      ),
    });

    return rows.map((row) => {
      const content = row.content as {
        requests: any[];
        folders: any[];
        variables: any[];
      };
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        version: row.version,
        requests: content?.requests ?? [],
        folders: content?.folders ?? [],
        variables: content?.variables ?? [],
        isSynced: true,
        updatedAt: row.updatedAt,
        syncedAt: row.syncedAt,
      };
    });
  }

  /**
   * Soft-delete a collection (mark as deleted).
   */
  async deleteCollection(userId: string, id: string): Promise<CollectionRow[]> {
    return this.db
      .update(schema.collections)
      .set({ isDeleted: true, syncedAt: new Date() })
      .where(
        and(
          eq(schema.collections.id, id),
          eq(schema.collections.userId, userId),
        ),
      )
      .returning();
  }
}
