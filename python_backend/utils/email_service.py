import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_email(to_email, subject, text_content=None, html_content=None):
    """
    Send an email using SendGrid
    """
    if not os.environ.get('SENDGRID_API_KEY'):
        print("SENDGRID_API_KEY environment variable is not set")
        return False

    try:
        sg = SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
        
        from_email = Email('info@heartlink.com')  # Use your verified sender
        to_email = To(to_email)
        
        if html_content:
            content = HtmlContent(html_content)
        else:
            content = Content("text/plain", text_content or "")
        
        mail = Mail(from_email, to_email, subject, content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        if response.status_code >= 200 and response.status_code < 300:
            return True
        else:
            print(f"SendGrid email error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"SendGrid email error: {e}")
        return False

def send_verification_email(email, first_name, verification_token):
    """
    Send a verification email with face recognition link
    """
    app_url = os.environ.get('APP_URL', 'http://localhost:5000')
    verification_url = f"{app_url}/face-verification?token={verification_token}"
    
    subject = 'Verify your Heartlink account'
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #ff4b6b, #ff9248); padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">Heartlink</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
        <h2>Hello, {first_name}!</h2>
        <p>Thank you for registering with Heartlink. To complete your registration and ensure the security of your account, we need to verify your identity.</p>
        <p>Please click the button below to verify your face:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{verification_url}" style="background: linear-gradient(to right, #ff4b6b, #ff9248); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify My Face</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #5c5c5c;">{verification_url}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account on Heartlink, please ignore this email.</p>
        <p>Best regards,<br>The Heartlink Team</p>
      </div>
      <div style="background: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; 2025 Heartlink. All rights reserved.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </div>
    """
    
    return send_email(email, subject, html_content=html)