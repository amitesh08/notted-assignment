import { authService } from "./api";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

// Simple Google Auth without complex singletons
export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    // Load Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("✅ Google Identity Services loaded");
      resolve();
    };

    script.onerror = () => {
      console.error("❌ Failed to load Google Identity Services");
      reject(new Error("Failed to load Google auth script"));
    };

    document.head.appendChild(script);
  });
};

// Simple Google Sign-In with proper error handling
export const signInWithGoogle = async (): Promise<{
  token: string;
  user: any;
}> => {
  try {
    // Ensure Google script is loaded
    await initializeGoogleAuth();

    // Get client ID from environment
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new Error(
        "Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file."
      );
    }

    console.log("🔧 Using Google Client ID:", clientId);

    return new Promise((resolve, reject) => {
      try {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: GoogleCredentialResponse) => {
            try {
              console.log("✅ Google credential received");

              if (!response.credential) {
                throw new Error("No credential received from Google");
              }

              // Send ID token to your backend
              console.log("🔄 Sending credential to backend...");
              const authResponse = await authService.googleAuth(
                response.credential
              );

              if (authResponse.success && authResponse.data) {
                console.log("✅ Backend authentication successful");
                resolve(authResponse.data);
              } else {
                throw new Error(
                  authResponse.message || "Backend authentication failed"
                );
              }
            } catch (error) {
              console.error("❌ Google auth callback error:", error);
              reject(error);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: "popup", // Force popup mode to avoid CORS issues
        });

        // Show Google One Tap prompt
        window.google.accounts.id.prompt((notification: any) => {
          console.log("📱 Google prompt notification:", notification);

          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log(
              "⚠️ One Tap not available, user must click button manually"
            );
            // Don't auto-click, let user click the Google button in your UI
            reject(
              new Error("Please click the Google Sign-In button to continue")
            );
          }
        });
      } catch (error) {
        console.error("❌ Google auth initialization error:", error);
        reject(error);
      }
    });
  } catch (error) {
    console.error("❌ Google auth setup error:", error);
    throw error;
  }
};

// Render Google Sign-In button (for manual clicking)
export const renderGoogleButton = (containerId: string): void => {
  try {
    const container = document.getElementById(containerId);
    if (!container || !window.google?.accounts?.id) {
      console.error(
        "❌ Cannot render Google button: container or Google SDK not found"
      );
      return;
    }

    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      type: "standard",
      shape: "rectangular",
      text: "continue_with",
      logo_alignment: "left",
      width: "100%",
    });

    console.log("✅ Google button rendered in container:", containerId);
  } catch (error) {
    console.error("❌ Error rendering Google button:", error);
  }
};
