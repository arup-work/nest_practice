import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MailService } from '../mail/mail.service';
import { Job } from 'bullmq';

@Processor('welcome-email')
export class WelcomeEmailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { email, name } = job.data;
    await this.mailService.welcomeEmail(email, name);
  }
}
