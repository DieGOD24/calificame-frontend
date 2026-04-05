import api from "./api";
import type { AuthToken, User, RegisterData } from "@/types/user";

export async function login(
  email: string,
  password: string
): Promise<AuthToken> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post<AuthToken>("/auth/login", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
}

export async function register(data: RegisterData): Promise<User> {
  const response = await api.post<User>("/auth/register", data);
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/auth/me");
  return response.data;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }
}
