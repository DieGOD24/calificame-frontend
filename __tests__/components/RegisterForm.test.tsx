import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
const mockRegister = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/register",
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock auth store
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    register: mockRegister,
    logout: vi.fn(),
    fetchUser: vi.fn(),
    initialize: vi.fn(),
  }),
}));

import { RegisterForm } from "@/components/auth/RegisterForm";

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockResolvedValue(undefined);
  });

  it("renders all form fields", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electronico/i)).toBeInTheDocument();
    // Two password fields
    const passwordFields = screen.getAllByLabelText(/contrasena/i);
    expect(passwordFields).toHaveLength(2);
  });

  it("renders submit button", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("button", { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nombre completo/i), "Test User");
    await user.type(screen.getByLabelText(/correo electronico/i), "test@test.com");

    const passwordFields = screen.getAllByLabelText(/contrasena/i);
    await user.type(passwordFields[0], "password123");
    await user.type(passwordFields[1], "different123");

    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/las contrasenas no coinciden/i)).toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nombre completo/i), "Test User");
    await user.type(screen.getByLabelText(/correo electronico/i), "test@test.com");

    const passwordFields = screen.getAllByLabelText(/contrasena/i);
    await user.type(passwordFields[0], "password123");
    await user.type(passwordFields[1], "password123");

    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
        full_name: "Test User",
      });
    });
  });
});
