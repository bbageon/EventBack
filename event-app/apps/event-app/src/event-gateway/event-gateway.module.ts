// apps/event-app/src/auth-gateway/auth-gateway.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventGatewayController } from './event-gateway.controller';
import { EventGatewayService } from './event-gateway.service';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'EVENT_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('EVENT_SERVICE_HOST') || 'event',
            port: configService.get<number>('EVENT_SERVICE_PORT') || 3002,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [EventGatewayController], // 이 모듈에 속한 컨트롤러 등록
  providers: [
    EventGatewayService
  ],
})
export class EventGatewayModule { }