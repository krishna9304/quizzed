import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { S3 } from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

@Injectable()
export class S3UploadUtil {
  private readonly maxFileSizeInKb = 200;
  private readonly allowedImageFormats = ['png', 'jpeg', 'jpg'];

  constructor(private readonly configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const s3 = new S3({
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
      });

      const key = `${Date.now()}-${file.originalname}`;

      const info = await sharp(file.buffer).metadata();

      if (this.allowedImageFormats.includes(info.format)) {
        const originalSizeKb = info.size / 1024;

        const ratio = Math.sqrt(this.maxFileSizeInKb / originalSizeKb);
        const targetWidth = Math.round(info.width * ratio);
        const targetHeight = Math.round(info.height * ratio);

        const optimisedImg = await sharp(file.buffer)
          .resize(targetWidth, targetHeight)
          .png({ quality: 60 })
          .toBuffer();

        const uploadParams: PutObjectRequest = {
          Bucket: this.configService.get<string>('S3_BUCKET_NAME'),
          Key: key,
          Body: optimisedImg,
        };

        const result = await s3.upload(uploadParams).promise();

        return result.Location;
      } else {
        throw new Error(
          'Invalid file format. Only .jpg, .jpeg, .png formats are allowed.',
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
