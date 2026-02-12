import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { AuthGuard } from '@nestjs/passport';

describe('CollectionsController', () => {
  let controller: CollectionsController;

  const mockCollectionsService = {
    syncFromDto: jest.fn(),
    getUserCollections: jest.fn(),
    deleteCollection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [
        {
          provide: CollectionsService,
          useValue: mockCollectionsService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CollectionsController>(CollectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
