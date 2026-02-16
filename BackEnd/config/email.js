import nodemailer from "nodemailer";

// Gmail configuration
// To use Gmail, you need to:
// 1. Create a Gmail account (or use existing)
// 2. Enable 2FA on your Gmail account
// 3. Generate an App Password: https://myaccount.google.com/apppasswords
// 4. Use the App Password below (not your regular password)

const emailConfig = {
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "your-email@gmail.com",
    pass: process.env.GMAIL_PASSWORD || "your-app-password"
  }
};

const transporter = nodemailer.createTransport(emailConfig);

export const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "TaxPal - Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">TaxPal</h1>
            <p style="margin: 0; font-size: 14px;">Password Reset Request</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px;">
            <p style="margin-top: 0;">Hello,</p>
            
            <p>You requested to reset your TaxPal password. Use the code below to proceed:</p>
            
            <div style="background: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <p style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #667eea; margin: 0;">
                ${resetCode}
              </p>
            </div>
            
            <p style="color: #666; font-size: 12px;">
              <strong>This code expires in 15 minutes.</strong>
            </p>
            
            <p style="color: #999; font-size: 12px;">
              If you didn't request a password reset, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
              © 2026 TaxPal. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", email);
    return result;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

export const sendTestEmail = async (testEmail) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER || "your-email@gmail.com",
      to: testEmail,
      subject: "TaxPal - Test Email",
      text: "This is a test email from TaxPal backend!"
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Test email sent to:", testEmail);
  } catch (error) {
    console.error("❌ Test email failed:", error.message);
    throw error;
  }
};
