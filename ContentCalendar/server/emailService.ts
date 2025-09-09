import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendContentReminder(
  userEmail: string,
  contentTitle: string,
  scheduledDate: Date,
  platform: string
): Promise<boolean> {
  const subject = `Reminder: Content "${contentTitle}" scheduled for ${platform}`;
  const text = `Hi there!\n\nThis is a friendly reminder that you have content scheduled:\n\nTitle: ${contentTitle}\nPlatform: ${platform}\nScheduled for: ${scheduledDate.toLocaleDateString()}\n\nTime to get publishing!\n\nBest regards,\nYour Content Planner`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Content Reminder 📅</h2>
      <p>Hi there!</p>
      <p>This is a friendly reminder that you have content scheduled:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">${contentTitle}</h3>
        <p style="margin: 5px 0;"><strong>Platform:</strong> ${platform}</p>
        <p style="margin: 5px 0;"><strong>Scheduled for:</strong> ${scheduledDate.toLocaleDateString()}</p>
      </div>
      <p>Time to get publishing! 🚀</p>
      <p>Best regards,<br>Your Content Planner</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@contentplanner.com', // You should use your verified sender
    subject,
    text,
    html,
  });
}