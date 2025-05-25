import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPasswordReset(email: string, token: string) {
    const url = `http://localhost:3000/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: 'reset-password',
      context: {
        url,
        email,
      },
    });
  }

  async welcomeEmail(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome email',
      template: 'welcome-email',
      context: {
        email,
        name,
      },
    });
  }
}
