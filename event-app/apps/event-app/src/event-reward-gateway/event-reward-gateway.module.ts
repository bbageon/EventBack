import { Module } from '@nestjs/common';
import { EventRewardGatewayService } from './event-reward-gateway.service';
import { EventRewardGatewayController } from './event-reward-gateway.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
  controllers: [EventRewardGatewayController],
  providers: [EventRewardGatewayService],
})
export class EventRewardGatewayModule { }
