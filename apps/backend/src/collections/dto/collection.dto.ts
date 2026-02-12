import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for syncing a collection from the client.
 */
export class SyncCollectionDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  version: string;

  @IsArray()
  requests: any[];

  @IsArray()
  folders: any[];

  @IsOptional()
  @IsArray()
  variables?: any[];

  @IsOptional()
  @IsBoolean()
  isSynced?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  updatedAt?: number;
}
