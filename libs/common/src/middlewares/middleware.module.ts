import { Module } from '@nestjs/common';
import { MiddlewareConsumer, NestModule } from '@nestjs/common/interfaces';
import { AzureBlobStorageMiddleware } from './azure-blob.upload';
import { S3StorageMiddleware } from './s3.upload';

@Module({
  providers: [AzureBlobStorageMiddleware, S3StorageMiddleware],
})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AzureBlobStorageMiddleware, S3StorageMiddleware)
      .forRoutes('/quiz/questions');
  }
}
