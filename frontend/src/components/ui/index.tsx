import React from "react";

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

// Loading Button Component
interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`flex items-center justify-center ${props.className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Blue Wave Background Component - CSS recreation of your design
const BlueWaveBackground: React.FC = () => {
  return (
    <div className="hidden lg:block w-1/2 relative">
      <img
        src="/blue-wave.png"
        alt="Blue Wave Background"
        className="h-full w-full object-cover"
      />
    </div>
  );
};

// HD Logo Component - Uses your actual logo PNG + "HD" text
const HDLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/logo.png" alt="HD Logo" className="w-6 h-6" />
      <span className="ml-2 text-lg font-semibold text-gray-900">HD</span>
    </div>
  );
};

// Input Field Component
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, error, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        {...props}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
          error ? "border-red-300 focus:ring-red-500" : "border-gray-200"
        } ${props.className || ""}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export {
  LoadingSpinner,
  LoadingButton,
  BlueWaveBackground,
  HDLogo,
  InputField,
};
