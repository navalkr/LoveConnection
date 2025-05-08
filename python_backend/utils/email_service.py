import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Content, Email
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get SendGrid API key
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
APP_URL = os.environ.get('APP_URL', 'http://localhost:5000')

def send_email(to_email, subject, text_content=None, html_content=None):
    """
    Send an email using SendGrid
    """
    if not SENDGRID_API_KEY:
        print("Warning: SENDGRID_API_KEY not found in environment variables")
        return False
    
    if not text_content and not html_content:
        raise ValueError("Either text_content or html_content must be provided")
    
    from_email = Email('noreply@heartlink.com')
    to_email = Email(to_email)
    
    # Create content object based on what's provided
    content = Content('text/html', html_content) if html_content else Content('text/plain', text_content)
    
    # Create mail object
    message = Mail(from_email, to_email, subject, content)
    
    try:
        # Send the email
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.client.mail.send.post(request_body=message.get())
        
        return response.status_code >= 200 and response.status_code < 300
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_verification_email(email, first_name, verification_token):
    """
    Send a verification email with face recognition link
    """
    subject = "Verify Your Heartlink Account"
    
    # Create verification URL
    verification_url = f"{APP_URL}/verify-face/{verification_token}"
    
    # Create email content
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff4b91;">Welcome to Heartlink, {first_name}!</h2>
        <p>Thank you for registering with Heartlink. To complete your registration, we need to verify your identity through our face verification system.</p>
        <p>This helps us ensure that all users on our platform are real people, creating a safer dating environment for everyone.</p>
        <div style="margin: 25px 0;">
            <a href="{verification_url}" style="background-color: #ff4b91; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify My Face</a>
        </div>
        <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
        <p><a href="{verification_url}">{verification_url}</a></p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>Thank you for choosing Heartlink!</p>
    </div>
    """
    
    return send_email(email, subject, html_content=html_content)