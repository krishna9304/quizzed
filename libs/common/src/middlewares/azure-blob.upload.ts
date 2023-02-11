import { Injectable, NestMiddleware, Next, Req, Res } from '@nestjs/common';
import multer from 'multer';
import {
  BlobServiceClient,
  ContainerClient,
  BlobClient,
} from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Response } from 'express';

@Injectable()
export class AzureBlobStorageMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  async use(
    @Req() req: multer.Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
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

    const storage = multer.memoryStorage();
    const upload = multer({ storage }).single('file');

    upload(req, res, async (error) => {
      if (error) {
        next(error);
        return;
      }

      const file = req.file;
      const blobName = `${Date.now()}-${file.originalname}`;
      const blobClient: BlobClient = containerClient.getBlobClient(blobName);

      try {
        const blockBlobClient = blobClient.getBlockBlobClient();
        await blockBlobClient.upload(file.buffer, file.size);
        req.file.url = blockBlobClient.url;
        next();
      } catch (err) {
        next(err);
      }
    });
  }
}
