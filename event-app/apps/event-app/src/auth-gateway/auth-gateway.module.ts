// apps/event-app/src/auth-gateway/auth-gateway.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigModule 임포트

import { AuthGatewayController } from './auth-gateway.controller';
import { AuthGatewayService } from './auth-gateway.service';


@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE', // Gateway 전체에서 Auth 서비스 클라이언트를 주입받을 때 사용할 이름
        imports: [ConfigModule], // ConfigService 사용을 위해 필요
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP, // TCP 트랜스포트 사용
          options: {
            host: configService.get<string>('AUTH_SERVICE_HOST') || 'auth',
            port: configService.get<number>('AUTH_SERVICE_PORT') || 3001,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthGatewayController], 
  providers: [
    AuthGatewayService,
  ],
})
export class AuthGatewayModule {}