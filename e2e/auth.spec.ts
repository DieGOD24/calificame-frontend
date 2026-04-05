import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can see landing page", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/califica examenes en/i)
    ).toBeVisible();
    await expect(page.getByText(/comenzar gratis/i)).toBeVisible();
  });

  test("user can navigate to login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /iniciar sesion/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: /iniciar sesion/i })
    ).toBeVisible();
  });

  test("user can navigate to register", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /comenzar gratis/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(
      page.getByRole("heading", { name: /crear cuenta/i })
    ).toBeVisible();
  });

  test("login form validates inputs", async ({ page }) => {
    await page.goto("/login");

    // Submit empty form
    await page.getByRole("button", { name: /iniciar sesion/i }).click();

    // Check validation errors
    await expect(
      page.getByText(/el correo es obligatorio/i)
    ).toBeVisible();

    // Type invalid email
    await page.getByLabel(/correo electronico/i).fill("invalid-email");
    await page.getByLabel(/contrasena/i).fill("12345");
    await page.getByRole("button", { name: /iniciar sesion/i }).click();

    await expect(
      page.getByText(/ingresa un correo valido/i)
    ).toBeVisible();
  });

  test("register form validates inputs", async ({ page }) => {
    await page.goto("/register");

    // Submit empty form
    await page.getByRole("button", { name: /crear cuenta/i }).click();

    // Check validation errors
    await expect(
      page.getByText(/el nombre es obligatorio/i)
    ).toBeVisible();
  });

  test("login page has link to register", async ({ page }) => {
    await page.goto("/login");
    const registerLink = page.getByRole("link", {
      name: /registrate aqui/i,
    });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("register page has link to login", async ({ page }) => {
    await page.goto("/register");
    const loginLink = page.getByRole("link", {
      name: /inicia sesion/i,
    });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
