import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import multer from 'multer';

@Injectable()
export class S3StorageMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  async use(req, res, next) {
    const s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });

    const storage = multer.memoryStorage();
    const upload = multer({ storage }).single('file');

    upload(req, res, async (error) => {
      if (error) {
        next(error);
        return;
      }

      const file = req.file;
      const key = `${Date.now()}-${file.originalname}`;

      const params: AWS.S3.Types.PutObjectRequest = {
        Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      try {
        const response = await s3.upload(params).promise();
        req.file.url = response.Location;
        next();
      } catch (err) {
        next(err);
      }
    });
  }
}
