import { APIResponse } from '@app/common/types';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  serverStats(): APIResponse {
    return this.appService.getServerStat();
  }
}
