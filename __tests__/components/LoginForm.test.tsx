import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/login",
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockLogin = vi.fn();

// Mock auth store
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
    register: vi.fn(),
    logout: vi.fn(),
    fetchUser: vi.fn(),
    initialize: vi.fn(),
  }),
}));

import { LoginForm } from "@/components/auth/LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
  });

  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/correo electronico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /iniciar sesion/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /iniciar sesion/i }));

    await waitFor(() => {
      expect(screen.getByText(/el correo es obligatorio/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/correo electronico/i), "invalid");
    await user.type(screen.getByLabelText(/contrasena/i), "password123");
    await user.click(screen.getByRole("button", { name: /iniciar sesion/i }));

    await waitFor(() => {
      expect(screen.getByText(/ingresa un correo valido/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/correo electronico/i), "test@test.com");
    await user.type(screen.getByLabelText(/contrasena/i), "12345");
    await user.click(screen.getByRole("button", { name: /iniciar sesion/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/la contrasena debe tener al menos 6 caracteres/i)
      ).toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/correo electronico/i), "test@test.com");
    await user.type(screen.getByLabelText(/contrasena/i), "password123");
    await user.click(screen.getByRole("button", { name: /iniciar sesion/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@test.com", "password123");
    });
  });
});
