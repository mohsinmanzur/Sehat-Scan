import { Inject, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { ConfigType } from '@nestjs/config';
import emailConfig from '../../../config/email.config';

@Injectable()
export class EmailService
{
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(@Inject(emailConfig.KEY) private emailConfiguration: ConfigType<typeof emailConfig>)
  {
    this.transporter = nodemailer.createTransport({
      host: this.emailConfiguration.host,
      port: this.emailConfiguration.port,
      secure: this.emailConfiguration.secure,
      auth: {
        user: this.emailConfiguration.auth.user,
        pass: this.emailConfiguration.auth.pass,
      },
    });
  }

  async sendLoginCode(email: string, code: string)
  {
    const from = this.emailConfiguration.from;
    const appUrl = this.emailConfiguration.appUrl;
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial">
        <h2>Your login code</h2>
        <p>Use this code to sign in. It expires in 5 minutes.</p>
        <div style="font-size:28px;letter-spacing:4px;font-weight:700">${code}</div>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <hr/>
        <p style="color:#666">© ${new Date().getFullYear()} <a href="${appUrl}">Our App</a></p>
      </div>
    `;

    await this.transporter.sendMail({
      from,
      to: email,
      subject: `Sehat Scan Login Code [${code}]`,
      text: `Your login code is: ${code}. It expires in 5 minutes.`,
      html,
    });
  }

}
