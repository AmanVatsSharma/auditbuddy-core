import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendAuditNotification(email: string, auditId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  await transporter.sendMail({
    from: '"Website Audit Tool" <audit@example.com>',
    to: email,
    subject: 'Your Website Audit Results',
    html: `
      <h1>Your Website Audit is Ready!</h1>
      <p>Click the link below to view your audit results:</p>
      <a href="${baseUrl}/audit/${auditId}">View Audit Results</a>
      <p>Want more detailed insights? Upgrade to our premium report!</p>
    `,
  });
} 