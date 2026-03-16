import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap()
{
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,   // strips extra properties
      forbidNonWhitelisted: true, // error if unknown property
      transform: true,   // transforms string -> number, etc.
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// https://sehatscan-abgtfbb6cmgmgugr.uaenorth-01.azurewebsites.net/