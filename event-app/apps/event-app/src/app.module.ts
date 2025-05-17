import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigModule 임포트 (필요시)
import * as Joi from 'joi';
import { DbModule } from '@app/common';

/** libs */
import { LoggerManagerModule } from '@app/common'; 
import { LoggerMiddleware } from '@app/common';
import { SwaggerManagerModule } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

const env = process.env.NODE_ENV || 'development';
const envFilePath = [
  `.env.${env}`,
  '.env.development',
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePath,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
    }),
    /** DB */
    DbModule,
    /** Libs */
    LoggerManagerModule,
    SwaggerManagerModule,
    /** Microservice Client 추가 */
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE', // 더 명확한 이름으로 변경 권장 (기존 USER_SERVICE도 유효)
        imports: [ConfigModule], // ConfigModule 임포트
        useFactory: (configService: ConfigService) => ({ // useFactory 사용
          transport: Transport.TCP,
          options: {
            host: 'auth', // Docker Compose 서비스 이름
            port: configService.get<number>('AUTH_SERVICE_PORT'), // 환경 변수에서 포트 읽기
          },
        }),
        inject: [ConfigService], // useFactory에 ConfigService 주입 명시
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
