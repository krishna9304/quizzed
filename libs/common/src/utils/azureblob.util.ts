import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from '@azure/storage-blob';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureBlobUtil {
  constructor(private readonly configService: ConfigService) {}

  getBlockBlobClient(filename: string): BlockBlobClient {
    const connectionString = this.configService.get<string>(
      'AZURE_BLOB_CONNECTION_STRING',
    );
    const containerName = this.configService.get<string>(
      'AZURE_BLOB_CONTAINER_NAME',
    );

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient: ContainerClient =
      blobServiceClient.getContainerClient(containerName);
    return containerClient.getBlockBlobClient(filename);
  }

  async uploadImage(file: Express.Multer.File) {
    try {
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = this.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(file.buffer);
      return blockBlobClient.url;
    } catch (error) {
      throw new HttpException('Unable to upload the file.', 415, {
        cause: new Error(error),
      });
    }
  }
}
