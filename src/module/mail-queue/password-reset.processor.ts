import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

@Processor('password-reset')
export class PasswordResetProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { email, token } = job.data;
    await this.mailService.sendPasswordReset(email, token);
  }
}
