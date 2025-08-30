import nodemailer from "nodemailer";

export class EmailService {
  static async sendOTP(email: string, otp: string): Promise<boolean> {
    try {
      // FOR DEVELOPMENT: Always log to console
      console.log("\n🔐 ===== OTP VERIFICATION =====");
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 OTP Code: ${otp}`);
      console.log(
        `⏰ Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`
      );
      console.log("==============================\n");

      // Always return true for development
      return true;

      // TODO: Enable real email in production
      /*
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Notes App - Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
      */
    } catch (error) {
      console.error("Email send error:", error);
      return false;
    }
  }
}
