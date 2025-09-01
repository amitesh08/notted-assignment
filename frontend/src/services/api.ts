import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type {
  ApiResponse,
  AuthResponse,
  SignupData,
  LoginData,
  OTPData,
  Note,
  CreateNoteData,
  UpdateNoteData,
  User,
} from "../types";

// Create axios instance with base configuration
const API_BASE_URL = "http://localhost:5000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication Service
export const authService = {
  // Send OTP for signup (single-step: email + password + name)
  sendSignupOTP: async (data: SignupData): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      "/auth/send-signup-otp",
      data
    );
    return response.data;
  },

  // Verify OTP and complete signup
  verifySignupOTP: async (
    data: OTPData
  ): Promise<ApiResponse<AuthResponse>> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await apiClient.post("/auth/verify-signup-otp", data);
    return response.data;
  },

  // Standard email/password login
  login: async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await apiClient.post("/auth/login", data);
    return response.data;
  },

  // Google OAuth login
  googleAuth: async (idToken: string): Promise<ApiResponse<AuthResponse>> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await apiClient.post("/auth/google", { idToken });
    return response.data;
  },

  // Get user profile (protected)
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await apiClient.get("/auth/profile");
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      "/auth/logout"
    );
    return response.data;
  },
};

// Notes Service
export const notesService = {
  // Get all user notes
  getNotes: async (): Promise<ApiResponse<{ notes: Note[] }>> => {
    const response: AxiosResponse<ApiResponse<{ notes: Note[] }>> =
      await apiClient.get("/notes");
    return response.data;
  },

  // Create new note
  createNote: async (
    data: CreateNoteData
  ): Promise<ApiResponse<{ note: Note }>> => {
    const response: AxiosResponse<ApiResponse<{ note: Note }>> =
      await apiClient.post("/notes", data);
    return response.data;
  },

  // Update existing note
  updateNote: async (
    id: string,
    data: UpdateNoteData
  ): Promise<ApiResponse<{ note: Note }>> => {
    const response: AxiosResponse<ApiResponse<{ note: Note }>> =
      await apiClient.put(`/notes/${id}`, data);
    return response.data;
  },

  // Delete note
  deleteNote: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(
      `/notes/${id}`
    );
    return response.data;
  },
};

// Token management utilities
export const tokenManager = {
  setToken: (token: string): void => {
    localStorage.setItem("authToken", token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  removeToken: (): void => {
    localStorage.removeItem("authToken");
    delete apiClient.defaults.headers.common["Authorization"];
  },

  getToken: (): string | null => {
    return localStorage.getItem("authToken");
  },
};

export default apiClient;
