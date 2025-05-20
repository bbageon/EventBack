import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

/** libs */
import {
  LoggerManagerModule,
  JwtStrategy,
  RolesGuard,
  LoggerMiddleware,
  SwaggerManagerModule
} from '@app/common';

// SubModule
import { AuthGatewayModule } from './auth-gateway/auth-gateway.module';
import { EventGatewayModule } from './event-gateway/event-gateway.module';
import { EventRewardGatewayModule } from './event-reward-gateway/event-reward-gateway.module';

// Auth
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';


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
        /** DB */
        MONGODB_URI: Joi.string().required(),
        /** SubModule */
        AUTH_SERVICE_PORT: Joi.number().required(),
        EVENT_SERVICE_PORT: Joi.number().required(),
        /** JWT */
        JWT_SECRET: Joi.string().required(),
      }),
      // ignoreEnvFile: true,
    }),
    /** Libs */
    LoggerManagerModule,
    SwaggerManagerModule,
    /** Passport */
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    /** JWT */
    JwtModule.registerAsync({
      imports: [ConfigModule], // ConfigService 주입을 위해 필요
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService], 
    }),
    
    /** Gateway Modules */
    AuthGatewayModule,
    EventGatewayModule,
    EventRewardGatewayModule,
  ],
  controllers: [
  ],
  providers: [
    JwtStrategy, 
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard, 
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard, 
    // },
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(private configService: ConfigService) {
    //  // 앱 시작 시 설정 값 확인 (선택 사항)
    //  this.logger.log(`Environment: ${env}`);
    //  this.logger.log(`Loaded ENV files: ${envFilePath.join(', ')}`);
    //  // 필요한 환경 변수 값 로깅
    //  this.logger.log(`AUTH_SERVICE_PORT: ${this.configService.get<number>('AUTH_SERVICE_PORT')}`);
    //  this.logger.log(`EVENT_SERVICE_PORT: ${this.configService.get<number>('EVENT_SERVICE_PORT')}`); // TODO
    //  this.logger.log(`JWT_SECRET: ${this.configService.get<string>('JWT_SECRET') ? 'Loaded' : 'NOT Loaded'}`);
    //  const jwtSecret = this.configService.get<string>('JWT_SECRET');
    //  if (jwtSecret) {
    
    //   this.logger.log(`>>> Gateway JWT_SECRET Value: ${jwtSecret}`);
    // }
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

}
