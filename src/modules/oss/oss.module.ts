import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OssController } from './oss.controller';
import { ConfigModule } from '@nestjs/config';
import { FileUploadMiddleware } from 'src/common/middleware/fileupload.middleware';
import { UpYunService } from './upyun/upyun.service';
import { AliService } from './ali/ali.service';

@Module({
  imports: [ConfigModule],
  controllers: [OssController],
  providers: [AliService, UpYunService],
})
export class OssModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FileUploadMiddleware).forRoutes('/image');
  }
}
