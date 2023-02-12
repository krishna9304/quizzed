import { Module } from '@nestjs/common';
import { MiddlewareConsumer, NestModule } from '@nestjs/common/interfaces';
import { AzureBlobStorageMiddleware } from './azure-blob.upload';
import { HttpExceptionFilter } from './http.exceptionfilter';
import { S3StorageMiddleware } from './s3.upload';

@Module({
  providers: [
    AzureBlobStorageMiddleware,
    S3StorageMiddleware,
    HttpExceptionFilter,
  ],
})
export class MiddlewareModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {}
}
