import { Module } from '@nestjs/common';
import { AzureBlobUtil } from './azureblob.util';

@Module({
  providers: [AzureBlobUtil],
  exports: [AzureBlobUtil],
})
export class UtilModule {}
