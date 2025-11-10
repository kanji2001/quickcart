import { emailService } from './email.service';
import { envConfig } from '../config/env';

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  orderId?: string | null;
};

export const supportService = {
  async submitContactRequest(payload: ContactPayload) {
    const recipient = envConfig.admin.email ?? envConfig.email.from;

    const html = `
      <div>
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> ${payload.email}</p>
        ${payload.orderId ? `<p><strong>Order ID:</strong> ${payload.orderId}</p>` : ''}
        <p><strong>Subject:</strong> ${payload.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${payload.message.replace(/\n/g, '<br />')}</p>
      </div>
    `;

    await emailService.sendEmail({
      to: recipient,
      subject: `[QuickCart] Contact request: ${payload.subject}`,
      html,
      text: `Name: ${payload.name}
Email: ${payload.email}
${payload.orderId ? `Order ID: ${payload.orderId}\n` : ''}Subject: ${payload.subject}

${payload.message}`,
    });
  },
};


