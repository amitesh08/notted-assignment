import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuthService {
  static async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error("Invalid Google token payload");
      }

      return {
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name || payload.given_name || "",
        picture: payload.picture,
        verified: payload.email_verified,
      };
    } catch (error) {
      console.error("Google token verification error:", error);
      throw new Error("Invalid Google token");
    }
  }
}
