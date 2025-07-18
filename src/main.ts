import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as basicAuth from 'express-basic-auth'
import * as dotenv from 'dotenv';
import { ResponseInterceptor } from './common/interceptors';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { AtGuard } from './common/guards/at.guard';
import { RolesGuard } from './common/guards/roles.guard';


dotenv.config();

const SWAGGER_ENVS = ['local', 'dev', 'staging'];

async function bootstrap() {
  const isProd = process.env.ENV === 'PROD'

  const Port = isProd ? process.env.PROD_PORT : process.env.DEV_PORT

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173', // ✅ your frontend origin
    credentials: true,               // ✅ allow cookies
  });


  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  )

  app.setGlobalPrefix('api')

  app.enableVersioning({
    type: VersioningType.URI
  })

  // configure Swagger
  if (!process.env.SWAGGER_USER || !process.env.SWAGGER_PASSWORD) {
    throw new Error(
      'SWAGGER_USER and SWAGGER_PASSWORD must be defined in the .env file.',
    );
  }

  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Drones Genie' + (isProd ? ' (PROD)' : ' ' + process.env.ENV))
    .setDescription('Drones Genie APIs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(Port || 3000, () => {
    console.log(`App is Running on Port ${Port}`)
  });
}
bootstrap();
