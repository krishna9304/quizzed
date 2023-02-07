import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailRequest } from './dto/mail.request';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { getOtpTemplate } from './templates/otp.template';

@Injectable()
export class MailerService {
  constructor(private readonly configService: ConfigService) {}
  private readonly logger = new Logger(MailerService.name);

  getTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtppro.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('MAILER_EMAIL'),
        pass: this.configService.get<string>('MAILER_PASS'),
      },
    });
  }

  async mail(data: MailRequest) {
    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: 'Admin | Quizzed',
        to: data.email,
        subject: 'Verify your email | Quizzed',
        html: getOtpTemplate(data.name, data.otp),
      });
      this.logger.log(`OTP sent to ${data.email}`);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
