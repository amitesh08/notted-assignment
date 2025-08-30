interface OTPData {
  otp: string;
  email: string;
  expiresAt: Date;
  // Store complete signup data
  signupData: {
    password: string;
    name?: string;
  };
}

export class OTPService {
  private static otpStore = new Map<string, OTPData>();

  // Updated to store complete signup data
  static generateAndStore(
    email: string,
    password: string,
    name?: string
  ): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.otpStore.set(email, {
      otp,
      email,
      expiresAt,
      signupData: {
        password,
        name,
      },
    });

    // Clean up expired OTPs
    this.cleanupExpired();

    return otp;
  }

  // Verify OTP and return stored signup data
  static verifyAndGetSignupData(
    email: string,
    otp: string
  ): { isValid: boolean; signupData?: { password: string; name?: string } } {
    const storedOTP = this.otpStore.get(email);

    if (!storedOTP) {
      return { isValid: false };
    }

    if (new Date() > storedOTP.expiresAt) {
      this.otpStore.delete(email);
      return { isValid: false };
    }

    if (storedOTP.otp !== otp) {
      return { isValid: false };
    }

    // OTP is valid, return data and remove from store
    const signupData = storedOTP.signupData;
    this.otpStore.delete(email);

    return { isValid: true, signupData };
  }

  private static cleanupExpired() {
    const now = new Date();
    for (const [email, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }
}
