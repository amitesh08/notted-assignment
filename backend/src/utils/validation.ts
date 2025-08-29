export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static validateSignup(email: string, password: string, name?: string) {
    const errors: string[] = [];

    if (!email) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(email)) {
      errors.push("Invalid email format");
    }

    if (!password) {
      errors.push("Password is required");
    } else if (!this.isValidPassword(password)) {
      errors.push("Password must be at least 6 characters long");
    }

    if (name && name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateLogin(email: string, password: string) {
    const errors: string[] = [];

    if (!email) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(email)) {
      errors.push("Invalid email format");
    }

    if (!password) {
      errors.push("Password is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
