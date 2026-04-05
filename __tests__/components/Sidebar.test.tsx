import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock auth store
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    user: { id: "1", full_name: "Test User", email: "test@test.com" },
    token: "test-token",
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    fetchUser: vi.fn(),
    initialize: vi.fn(),
  }),
}));

// Mock sidebar store
const mockToggle = vi.fn();
let mockIsCollapsed = false;

vi.mock("@/stores/sidebarStore", () => ({
  useSidebarStore: () => ({
    isCollapsed: mockIsCollapsed,
    toggle: mockToggle,
    collapse: vi.fn(),
    expand: vi.fn(),
  }),
}));

import { Sidebar } from "@/components/layout/Sidebar";

describe("Sidebar", () => {
  beforeEach(() => {
    mockIsCollapsed = false;
    vi.clearAllMocks();
  });

  it("renders sidebar navigation items", () => {
    render(<Sidebar />);
    expect(screen.getByText("Panel Principal")).toBeInTheDocument();
    expect(screen.getByText("Proyectos")).toBeInTheDocument();
    expect(screen.getByText("Nuevo Proyecto")).toBeInTheDocument();
  });

  it("renders Calificame brand name when expanded", () => {
    render(<Sidebar />);
    expect(screen.getByText("Calificame")).toBeInTheDocument();
  });

  it("highlights the active link", () => {
    render(<Sidebar />);
    const dashboardLink = screen.getByText("Panel Principal").closest("a");
    expect(dashboardLink?.className).toContain("bg-indigo-50");
  });

  it("renders the logout button", () => {
    render(<Sidebar />);
    expect(screen.getByText("Cerrar Sesion")).toBeInTheDocument();
  });

  it("calls toggle when collapse button is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const collapseButton = screen.getByLabelText("Colapsar menu");
    await user.click(collapseButton);
    expect(mockToggle).toHaveBeenCalled();
  });

  it("shows user name when expanded", () => {
    render(<Sidebar />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });
});
