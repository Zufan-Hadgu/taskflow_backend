import { Injectable } from '@nestjs/common';
import { MailerService } from 'node_modules/@nestjs-modules/mailer/dist/mailer.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
  ) {}

  async sendWelcomeEmail(
    email: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,

      from: 'noreply@PintronTech.com',

      subject: 'Welcome to Our Platform',

      html: `
        <h1>Welcome!</h1>

        <p>
          Thank you for joining our platform.
        </p>
      `,
    });
  }
}