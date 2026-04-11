import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_otp_email(to_email: str, otp: str):
    # Hack-o-Holic config: uses a Gmail app password from environment variables
    gmail_user = os.environ.get("GMAIL_USER")
    gmail_app_password = os.environ.get("GMAIL_APP_PASSWORD")

    if not gmail_user or not gmail_app_password:
        print("\n" + "="*55)
        print(f"🚨 DEMO OTP TERMINAL FALLBACK 🚨")
        print(f"OTP for {to_email} is: {otp}")
        print("To send real emails, set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env")
        print("="*55 + "\n")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = gmail_user
        msg['To'] = to_email
        msg['Subject'] = "🔐 Your Digital Twin Verification Code"

        html = f"""
        <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #06060b; color: #f0f0ff; padding: 30px; text-align: center;">
                <div style="max-width: 400px; margin: 0 auto; background-color: #12121e; padding: 40px; border-radius: 16px; border: 1px solid rgba(124, 58, 237, 0.3);">
                    <h2 style="color: #7c3aed; margin-top: 0; font-weight: 800; letter-spacing: -0.5px;">Digital Twin <span style="color: #3b82f6;">of You</span></h2>
                    <p style="color: #8888aa; font-size: 14px; margin-bottom: 25px;">Please use the verification code below to verify your email address and activate your account.</p>
                    
                    <div style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #10b981; padding: 20px 0; background: rgba(16, 185, 129, 0.08); border-radius: 8px; margin-bottom: 25px; border: 1px solid rgba(16, 185, 129, 0.2);">
                        {otp}
                    </div>
                    
                    <p style="color: #4a4a6a; font-size: 12px; margin-bottom: 0;">Team Bit Rebels · Hack-o-Holic 4.0</p>
                    <p style="color: #4a4a6a; font-size: 11px; margin-top: 5px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(html, 'html'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_app_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
