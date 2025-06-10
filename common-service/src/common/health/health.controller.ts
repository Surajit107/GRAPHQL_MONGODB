import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { DatabaseService } from '../services/database.service';
import { LoggerService } from '../services/logger.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private databaseService: DatabaseService,
    private logger: LoggerService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    this.logger.log('Health check initiated', 'HealthController');
    return this.health.check([
      async () => {
        const isHealthy = await this.databaseService.healthCheck();
        return {
          database: {
            status: isHealthy ? 'up' : 'down',
          },
        };
      },
    ]);
  }
}