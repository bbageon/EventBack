import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Schema
import {
  Event,
  EventSchema,
} from './schemas/event.schema';

// user-checkin-progress.schema.ts 파일에서 정의한 스키마와 클래스
import {
  UserSummerEventProgress, // 스키마 클래스 이름
  UserEventProgressSchema, // 스키마 객체 이름
  // UserEventProgressDocument // 문서 타입은 서비스에서 주로 사용
} from './schemas/userEventProgress.schema'

// Service, Controller
import { EventService } from './event.service';     // EventService 임포트
import { EventController } from './event.controller'; // EventController 임포트
import * as Joi from 'joi';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DbModule, JwtStrategy, RolesGuard } from '@app/common';
import { Reflector } from '@nestjs/core';
/** module */
import { RewardModule } from './reward/reward.module';

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
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: UserSummerEventProgress.name, schema: UserEventProgressSchema },
    ]),
    /** module */
    RewardModule,
  ],
  controllers: [
    EventController,
  ],
  providers: [
    EventService,
    JwtStrategy,
    RolesGuard,
    Reflector,
  ],
  exports: [EventService, JwtStrategy, RolesGuard, Reflector,]
})
export class EventModule { }