import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService, private mongo: MongooseHealthIndicator) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([() => this.mongo.pingCheck('mongo')]);
  }
} 