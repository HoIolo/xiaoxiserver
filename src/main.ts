import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import helmet from 'helmet';
import { join } from 'path';

// api文档插件
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import getLogLevels from './utils/getLogLevels';
import { NestExpressApplication } from '@nestjs/platform-express';
import { COMMON_CONFIG } from './config/common.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: getLogLevels(process.env.NODE_ENV === 'production'),
  });
  app.useStaticAssets(join(__dirname, '..', 'upload'), {
    prefix: '/upload/',
  });
  app.enableCors({
    origin: process.env.ALLOW_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  app.set('trust proxy', 1);

  app.use(helmet());
  // 设置全局访问前缀
  app.setGlobalPrefix('/api/v1');
  // 设置全局http异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  // 设置全局参数验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
    }),
  );
  // 设置全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  const options = new DocumentBuilder()
    .setTitle('小析blog API服务')
    .setDescription('使用nest书写的小析blog API服务') // 文档介绍
    .setVersion('1.0.0') // 文档版本
    // .setBasePath('http://localhost:5000')
    .build();
  // 为了创建完整的文档（具有定义的HTTP路由），我们使用类的createDocument()方法SwaggerModule。此方法带有两个参数，分别是应用程序实例和基本Swagger选项。
  const document = SwaggerModule.createDocument(app, options);
  // 最后一步是setup()。它依次接受（1）装入Swagger的路径，（2）应用程序实例, （3）描述Nest应用程序的文档。
  SwaggerModule.setup('/api', app, document);

  await app.listen(COMMON_CONFIG.SERVER_PORT);
}
bootstrap();
