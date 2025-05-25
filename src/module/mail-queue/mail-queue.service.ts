import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailQueueService {
  constructor(
    @InjectQueue('password-reset') private readonly passwordResetQueue: Queue,
    @InjectQueue('welcome-email') private readonly welcomeMailQueue: Queue,
  ) {}

  async queueForgetPassword(email: string, token: string) {
    await this.passwordResetQueue.add('password-reset', { email, token });
  }

  async queueWelcomeEmail(email: string, name: string) {
    console.log({ email, name });
    
    await this.welcomeMailQueue.add('welcome-email', { email, name });
  }
}
