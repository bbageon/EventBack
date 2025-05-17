import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { LoggerManagerModule } from './LoggerManager/LoggerManager.module';
import { SwaggerManagerModule } from './SwaggerManager/SwaggerManager.module';

@Module({
  imports : [
    LoggerManagerModule,
    SwaggerManagerModule,
  ],
  providers: [CommonService],
  exports: [
    CommonService,
    LoggerManagerModule,
    SwaggerManagerModule,
  ],
})
export class CommonModule {}
