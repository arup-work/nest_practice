import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
     constructor(private mailerService: MailerService) {}

     async sendPasswordReset(email: string, token: string){
        console.log({email,token});
        
        const url = `http://localhost:3000/reset-password?token=${token}`;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Reset your password',
            template: 'reset-password',
            context: {
                url,
                email
            }
        });
     }

}