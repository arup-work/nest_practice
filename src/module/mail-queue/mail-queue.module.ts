import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { MailQueueService } from './mail-queue.service';
import { PasswordResetProcessor } from './password-reset.processor';
import { MailModule } from '../mail/mail.module';
import { WelcomeEmailProcessor } from './welcome-email.processor';

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: 'password-reset',
        }),
        BullModule.registerQueue({
            name: 'welcome-email',
        }),
        MailModule
    ],
    providers: [MailQueueService, PasswordResetProcessor,WelcomeEmailProcessor],
    exports: [MailQueueService]
})
export class MailQueueModule {}
