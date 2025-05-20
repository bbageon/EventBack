// apps/event/src/reward/reward.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EventModule } from '../event.module';

import { Event, EventSchema } from '../schemas/event.schema';
import { UserSummerEventProgress, UserEventProgressSchema } from '../schemas/userEventProgress.schema';

import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';
import { RewardClaimLog, RewardClaimLogSchema } from '../schemas/reward-log.schema';


@Module({
  imports: [
    forwardRef(() => EventModule),

    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: UserSummerEventProgress.name, schema: UserEventProgressSchema },
      { name: RewardClaimLog.name, schema: RewardClaimLogSchema }
    ]),

    // --- 보상 지급을 위한 Microservice 클라이언트 설정 (주석 처리) ---
    // ClientsModule.registerAsync({
    //   isGlobal: true, // Global 설정 여부는 필요에 따라 조정
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => [
    //     {
    //       name: 'REWARD_SERVICE',
    //       transport: Transport.TCP, // 실제 사용될 Transport 타입 확인
    //       options: {
    //         host: configService.get<string>('REWARD_SERVICE_HOST') || 'reward',
    //         port: configService.get<number>('REWARD_SERVICE_PORT') || 3003,
    //       },
    //     },
    //   ],
    //   inject: [ConfigService],
    // }),

    ConfigModule,
  ],
  controllers: [
    RewardController,
  ],
  providers: [
    RewardService,
  ],
  exports: [
    RewardService,
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: UserSummerEventProgress.name, schema: UserEventProgressSchema },
      { name: RewardClaimLog.name, schema: RewardClaimLogSchema },
    ]),
  ]
})
export class RewardModule {}