import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { AuthGuard } from '@nestjs/passport';
import { SyncCollectionDto } from './dto/collection.dto';
import type { AuthenticatedRequest } from '../types/authenticated-request';
import { ApiResponse } from '../common/api-response';

@Controller('collections')
@UseGuards(AuthGuard('jwt'))
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post('sync')
  async sync(
    @Req() req: AuthenticatedRequest,
    @Body() body: SyncCollectionDto,
  ) {
    const result = await this.collectionsService.syncFromDto(
      req.user.userId,
      body,
    );
    return ApiResponse.ok(result);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    const collections = await this.collectionsService.getUserCollections(
      req.user.userId,
    );
    return ApiResponse.ok(collections);
  }

  @Delete(':id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const result = await this.collectionsService.deleteCollection(
      req.user.userId,
      id,
    );
    return ApiResponse.ok(result);
  }
}
