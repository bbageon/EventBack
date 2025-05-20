// apps/event-app/src/auth-gateway/auth-gateway.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigModule 임포트

import { AuthGatewayController } from './auth-gateway.controller';
import { AuthGatewayService } from './auth-gateway.service';

// Auth 서비스 클라이언트 설정에 필요한 환경 변수명을 여기서 사용합니다.
// 이 변수들은 Gateway 앱의 .env 파일에 정의되어야 합니다.

@Module({
  imports: [
    // ConfigModule은 AppMoudle에서 Global로 설정했으므로 여기서 임포트하지 않아도 되지만,
    // 명시적으로 useFactory에서 사용하기 위해 다시 임포트해주는 것이 좋습니다.
    ConfigModule,
    // Auth 서비스 마이크로서비스 클라이언트 설정
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE', // Gateway 전체에서 Auth 서비스 클라이언트를 주입받을 때 사용할 이름
        imports: [ConfigModule], // ConfigService 사용을 위해 필요
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP, // TCP 트랜스포트 사용
          options: {
            // 환경 변수에서 Auth 서비스의 호스트와 포트 정보를 읽어옵니다.
            host: configService.get<string>('AUTH_SERVICE_HOST') || 'auth',
            port: configService.get<number>('AUTH_SERVICE_PORT') || 3001,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    // TODO: 필요한 경우 인증 가드나 역할 가드를 여기서 프로바이더로 제공하거나 임포트합니다.
    // 예: PassportModule, JwtStrategy 등
  ],
  controllers: [AuthGatewayController], // 이 모듈에 속한 컨트롤러 등록
  providers: [
    AuthGatewayService,
    // TODO: RoleGuard 등 인증/권한 관련 프로바이더를 여기서 정의하거나 임포트합니다.
    // RoleGuard는 AppMoudle에서 Global Guard로 등록될 수도 있고, 여기서만 사용될 수도 있습니다.
  ],
  // TODO: 만약 AuthGatewayService나 AuthGatewayController가 다른 모듈에서도 필요하다면 exports에 추가합니다.
  // 예: exports: [AuthGatewayService, ClientsModule]
})
export class AuthGatewayModule {}