import nodemailer from 'nodemailer';
import { envConfig, isProduction } from '../config/env';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: envConfig.email.host,
  port: envConfig.email.port,
  secure: envConfig.email.port === 465,
  auth: {
    user: envConfig.email.user,
    pass: envConfig.email.password,
  },
});

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export const emailService = {
  async sendEmail({ to, subject, html, text }: SendEmailParams) {
    if (!isProduction) {
      logger.info('Email sending skipped in development. Subject: %s, To: %s', subject, to);
      return;
    }

    await transporter.sendMail({
      from: envConfig.email.from,
      to,
      subject,
      html,
      text,
    });
  },
};

