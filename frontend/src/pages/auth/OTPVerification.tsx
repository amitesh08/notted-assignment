import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { OTPData } from "../../types";
import { LoadingButton, HDLogo, BlueWaveBackground } from "../../components/ui";

const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Get email from navigation state
  const email = location.state?.email;

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format timer display (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change - only allow digits, max 6 characters
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 6) {
      setOtp(value);
      setError(""); // Clear error on input
    }
  };

  // Submit OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const otpData: OTPData = { email, otp };
      const response = await authService.verifySignupOTP(otpData);

      if (response.success && response.data) {
        // Login user with returned token and user data
        login(response.data.token, response.data.user);
        navigate("/dashboard");
      } else {
        setError(response.message || "Invalid OTP");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function - redirect back to signup for now
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setError("");

      // Reset timer and navigate back to signup
      navigate("/signup");
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null; // Will redirect in useEffect

  return (
    <div className="min-h-screen flex">
      {/* Left Side - OTP Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <HDLogo className="mb-8" />

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify OTP
            </h1>
            <p className="text-gray-600">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-2xl font-mono tracking-widest"
              />

              {/* Timer Display */}
              <div className="mt-2 flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {timeLeft > 0
                    ? `Code expires in ${formatTime(timeLeft)}`
                    : "Code expired"}
                </span>
                {canResend && (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            {/* Verify Button */}
            <LoadingButton
              loading={loading}
              type="submit"
              disabled={otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Verify & Sign Up
            </LoadingButton>
          </form>

          {/* Back to Signup Link */}
          <div className="mt-6 text-center">
            <Link to="/signup" className="text-gray-600 hover:text-gray-700">
              ← Back to Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Blue Wave Background */}
      <BlueWaveBackground />
    </div>
  );
};

export default OTPVerification;
