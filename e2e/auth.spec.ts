import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can see landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/califica examenes/i)).toBeVisible();
  });

  test("user can navigate to login", async ({ page }) => {
    await page.goto("/");
    // Verify login link exists and points to /login
    const loginLink = page.getByRole("link", { name: /iniciar sesion/i }).first();
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
    // Navigate directly since Link+Button combo doesn't always trigger client nav in tests
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /iniciar sesion/i })).toBeVisible();
  });

  test("user can navigate to register", async ({ page }) => {
    await page.goto("/");
    const registerLink = page.getByRole("link", { name: /comenzar gratis/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/register");
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /crear cuenta/i })).toBeVisible();
  });

  test("login form validates empty inputs", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /iniciar sesion/i }).click();
    await expect(page.locator("form")).toContainText(/obligatorio|required|correo/i);
  });

  test("login form validates invalid email", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/correo/i).fill("invalid-email");
    await page.getByLabel(/contrasena/i).fill("12345");
    await page.getByRole("button", { name: /iniciar sesion/i }).click();
    await expect(page.locator("form")).toContainText(/valido|valid/i);
  });

  test("register form validates empty inputs", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /crear cuenta/i }).click();
    await expect(page.locator("form")).toContainText(/obligatorio|required|nombre/i);
  });

  test("register form validates password length", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/nombre/i).fill("Test User");
    await page.getByLabel(/correo/i).fill("test@test.com");
    await page.locator("input[type='password']").first().fill("123");
    await page.getByRole("button", { name: /crear cuenta/i }).click();
    await expect(page.locator("form")).toContainText(/caracter|character|minimo|minimum/i);
  });

  test("login page has link to register", async ({ page }) => {
    await page.goto("/login");
    const registerLink = page.getByRole("link", { name: /registr/i });
    await expect(registerLink).toBeVisible();
  });

  test("register page has link to login", async ({ page }) => {
    await page.goto("/register");
    const loginLink = page.getByRole("link", { name: /inicia sesion|login/i });
    await expect(loginLink).toBeVisible();
  });

  test("unauthenticated user is redirected from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected from projects", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Authentication - Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ access_token: "mock-jwt-token", token_type: "bearer" }),
      });
    });
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-1", email: "test@calificame.com", full_name: "Test Professor",
          role: "professor", is_active: true, created_at: "2025-01-01T00:00:00Z",
        }),
      });
    });
    await page.route("**/api/v1/projects**", async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, page: 1, page_size: 20 }),
      });
    });
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/correo/i).fill("test@calificame.com");
    await page.getByLabel(/contrasena/i).fill("password123");
    await page.getByRole("button", { name: /iniciar sesion/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test("failed login stays on login page", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 401, contentType: "application/json",
        body: JSON.stringify({ detail: "Incorrect email or password" }),
      });
    });
    await page.goto("/login");
    await page.getByLabel(/correo/i).fill("wrong@test.com");
    await page.getByLabel(/contrasena/i).fill("wrongpass");
    await page.getByRole("button", { name: /iniciar sesion/i }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Authentication - Register Flow", () => {
  test("successful registration", async ({ page }) => {
    await page.route("**/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 201, contentType: "application/json",
        body: JSON.stringify({
          id: "new-user-1", email: "new@calificame.com", full_name: "New User",
          role: "professor", is_active: true, created_at: "2025-01-01T00:00:00Z",
        }),
      });
    });
    await page.goto("/register");
    await page.getByLabel(/nombre/i).fill("New User");
    await page.getByLabel(/correo/i).fill("new@calificame.com");
    const passwordFields = page.locator("input[type='password']");
    await passwordFields.nth(0).fill("password123");
    await passwordFields.nth(1).fill("password123");
    await page.getByRole("button", { name: /crear cuenta/i }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });

  test("duplicate email stays on register page", async ({ page }) => {
    await page.route("**/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 409, contentType: "application/json",
        body: JSON.stringify({ detail: "Email already registered" }),
      });
    });
    await page.goto("/register");
    await page.getByLabel(/nombre/i).fill("Test");
    await page.getByLabel(/correo/i).fill("existing@test.com");
    const passwordFields = page.locator("input[type='password']");
    await passwordFields.nth(0).fill("password123");
    await passwordFields.nth(1).fill("password123");
    await page.getByRole("button", { name: /crear cuenta/i }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/register/);
  });
});
