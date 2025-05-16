import sgMail from '@sendgrid/mail';

// Check if API key exists, but don't throw an error if missing
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set - email functionality will be limited");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // If SENDGRID_API_KEY isn't set, log the email content for development
    if (!process.env.SENDGRID_API_KEY) {
      console.log('=== DEVELOPMENT EMAIL ===');
      console.log(`To: ${params.to}`);
      console.log(`Subject: ${params.subject}`);
      console.log('Content:', params.html || params.text || 'No content');
      console.log('========================');
      return true; // Return success in development mode
    }
    
    const msg = {
      to: params.to,
      from: 'info@heartlink.com', // Use your verified sender
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    };
    
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string, 
  firstName: string, 
  verificationToken: string
): Promise<boolean> {
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  const verificationUrl = `${appUrl}/face-verification?token=${verificationToken}`;
  
  const subject = 'Verify your Heartlink account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #ff4b6b, #ff9248); padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">Heartlink</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
        <h2>Hello, ${firstName}!</h2>
        <p>Thank you for registering with Heartlink. To complete your registration and ensure the security of your account, we need to verify your identity.</p>
        <p>Please click the button below to verify your face:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(to right, #ff4b6b, #ff9248); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify My Face</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #5c5c5c;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account on Heartlink, please ignore this email.</p>
        <p>Best regards,<br>The Heartlink Team</p>
      </div>
      <div style="background: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; 2025 Heartlink. All rights reserved.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html
  });
}