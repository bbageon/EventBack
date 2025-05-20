// NEST
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';

// MicroService
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  console.log(process.env.AUTH_SERVICE_PORT)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport : Transport.TCP,
      options : {
        host : '0.0.0.0',
        port : Number(process.env.AUTH_SERVICE_PORT) || 3001,
      }
    },
  );
  await app.listen();
}
bootstrap();
