import { Test, TestingModule } from '@nestjs/testing';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';

describe('LiveController', () => {
  let liveController: LiveController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LiveController],
      providers: [LiveService],
    }).compile();

    liveController = app.get<LiveController>(LiveController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(liveController.getHello()).toBe('Hello World!');
    });
  });
});
