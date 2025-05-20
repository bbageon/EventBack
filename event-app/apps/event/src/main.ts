import { NestFactory } from '@nestjs/core';
import { EventModule } from './event.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  console.log(process.env.EVENT_SERVICE_PORT)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EventModule,
      {
        transport : Transport.TCP,
        options : {
          host : '0.0.0.0',
          port : Number(process.env.EVENT_SERVICE_PORT) || 3002,
        }
      },
    );
    await app.listen();
}
bootstrap();
