// apps/auth/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport'; // PassportModule 임포트 (JwtService와 연동 등)
import { JwtModule } from '@nestjs/jwt'; // JwtModule 임포트 (JWT 발행에 사용)
import { ConfigService, ConfigModule } from '@nestjs/config'; // ConfigService, ConfigModule 임포트 (JWT 설정에 사용)

// User 스키마 임포트
import { User, UserSchema } from './schemas/user.schema';
// AuthService, AuthController 임포트
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// TODO: DbModule이 전역 DB 연결을 제공한다면 필요합니다. 아니라면 제거합니다.
import { DbModule } from '@app/common';
import * as Joi from 'joi';

// Note: JwtStrategy, RolesGuard, Reflector 는 게이트웨이의 HTTP 인증/권한 검사에 사용되므로
// auth Microservice의 providers 또는 imports에 필요하지 않습니다.


const env = process.env.NODE_ENV || 'development';
const envFilePath = [
  `.env.${env}`,
  '.env.development',
  '.env',
];

@Module({
  imports: [
    // 환경 설정 모듈 (JWT 설정에 사용)
    ConfigModule.forRoot({
      isGlobal: true, // 전역 설정
      envFilePath: envFilePath,
      validationSchema: Joi.object({ // Joi 임포트 필요
        MONGODB_URI: Joi.string().required(), // MongoDB 연결 URI
        JWT_SECRET: Joi.string().required(), // JWT 비밀 키
      }),
    }),
    // TODO: DbModule이 전역 DB 연결을 제공한다면 필요합니다. 아니라면 제거하고 MongooseModule.forRoot를 사용합니다.
    DbModule,

    // Mongoose 스키마 등록 (User 모델)
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    // Passport 및 JWT 모듈 설정 (JWT 발행에 사용)
    PassportModule.register({ defaultStrategy: 'jwt' }), // Auth 서비스 내부에서 Passport 사용 시 필요
    JwtModule.registerAsync({ // JWT 토큰 발행 설정
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        // signOptions: { expiresIn: '60s' }, // 토큰 만료 시간 (필요시)
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    // Auth Microservice의 메시지 핸들링 컨트롤러 등록
    AuthController,
  ],
  providers: [
    // AuthService 등록
    AuthService,
    // Note: JwtStrategy, RolesGuard, Reflector 는 이곳에 필요하지 않습니다.
  ],
  exports: [
    // AuthService를 Auth 앱 내 다른 모듈에서 사용한다면 export
    AuthService,
    // JwtModule, PassportModule 은 일반적으로 다른 Microservice에서 직접 임포트하지 않습니다.
    // 필요하다면 특정 서비스나 기능만 export 합니다.
    // JwtModule, // 일반적으로 export 하지 않음
    // PassportModule, // 일반적으로 export 하지 않음
    // RolesGuard, // 게이트웨이용이므로 여기에 필요 없음
    // Reflector, // 게이트웨이용이므로 여기에 필요 없음
    // User 모델이 다른 Auth 앱 내 모듈에서 필요하다면 MongooseModule.forFeature 결과를 export 합니다.
    // MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class AuthModule {}