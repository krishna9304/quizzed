import { APIResponse } from '@app/common/types';
import { Controller, Get } from '@nestjs/common';
import { LiveService } from './live.service';

@Controller()
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Get()
  serverStats(): APIResponse {
    return this.liveService.getServerStat();
  }
}
