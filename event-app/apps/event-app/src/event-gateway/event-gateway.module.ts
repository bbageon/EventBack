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
    // TODO: 필요한 경우 인증 가드나 역할 가드를 여기서 프로바이더로 제공하거나 임포트합니다.
    // 예: PassportModule, JwtStrategy 등
  ],
  controllers: [EventGatewayController], // 이 모듈에 속한 컨트롤러 등록
  providers: [
    EventGatewayService
  ],
  // TODO: 만약 AuthGatewayService나 AuthGatewayController가 다른 모듈에서도 필요하다면 exports에 추가합니다.
  // 예: exports: [AuthGatewayService, ClientsModule]
})
export class EventGatewayModule { }