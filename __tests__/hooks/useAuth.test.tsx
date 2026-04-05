import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockPush = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
}));

const mockInitialize = vi.fn();
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockRegister = vi.fn();

let mockState = {
  user: null as { id: string; full_name: string; email: string } | null,
  token: null as string | null,
  isAuthenticated: false,
  isLoading: true,
};

vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    ...mockState,
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    fetchUser: vi.fn(),
    initialize: mockInitialize,
  }),
}));

import { useAuth } from "@/hooks/useAuth";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    };
  });

  it("calls initialize on mount", () => {
    renderHook(() => useAuth());
    expect(mockInitialize).toHaveBeenCalled();
  });

  it("returns authentication state", () => {
    mockState = {
      user: { id: "1", full_name: "Test", email: "test@test.com" },
      token: "token",
      isAuthenticated: true,
      isLoading: false,
    };

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.full_name).toBe("Test");
    expect(result.current.token).toBe("token");
    expect(result.current.isLoading).toBe(false);
  });

  it("returns login function", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.login).toBe(mockLogin);
  });

  it("returns register function", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.register).toBe(mockRegister);
  });

  it("returns logout function", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.logout).toBe(mockLogout);
  });

  it("redirects to login when requireAuth is true and not authenticated", async () => {
    mockState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };

    renderHook(() => useAuth(true));

    // The useEffect should redirect
    await act(async () => {
      // Allow effects to run
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("does not redirect when requireAuth is true and authenticated", async () => {
    mockState = {
      user: { id: "1", full_name: "Test", email: "test@test.com" },
      token: "token",
      isAuthenticated: true,
      isLoading: false,
    };

    renderHook(() => useAuth(true));

    await act(async () => {});

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not redirect while loading", async () => {
    mockState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    };

    renderHook(() => useAuth(true));

    await act(async () => {});

    expect(mockPush).not.toHaveBeenCalled();
  });
});
