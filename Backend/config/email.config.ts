import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT ?? '465', 10),
  secure: process.env.SMTP_SECURE === 'true' || true, // true for Gmail (port 465)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  from: process.env.EMAIL_FROM || 'No Reply <no-reply@sehatscan.com>',
  appUrl: process.env.APP_URL || 'https://sehatscan-abgtfbb6cmgmgugr.uaenorth-01.azurewebsites.net/',
}));
