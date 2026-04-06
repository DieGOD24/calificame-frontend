import { test, expect } from "@playwright/test";
import { loginAsMock, mockAdminUser } from "./helpers";

const mockInstitution = {
  id: "inst-1",
  name: "Universidad Nacional",
  slug: "universidad-nacional",
  logo_url: null,
  primary_color: "#4f46e5",
  plan: "free",
  max_professors: 10,
  max_students: 100,
  member_count: 3,
  created_at: "2025-01-01T00:00:00Z",
};

const mockMembers = [
  {
    id: "member-1",
    user_id: "admin-1",
    institution_id: "inst-1",
    role: "owner",
    joined_at: "2025-01-01T00:00:00Z",
    user_email: "admin@calificame.com",
    user_name: "Admin User",
  },
  {
    id: "member-2",
    user_id: "user-2",
    institution_id: "inst-1",
    role: "professor",
    joined_at: "2025-02-01T00:00:00Z",
    user_email: "prof@calificame.com",
    user_name: "Professor One",
  },
];

test.describe("Institutions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page, mockAdminUser);

    await page.route("**/api/v1/institutions", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockInstitution]),
        });
      } else if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            ...mockInstitution,
            id: "inst-new",
            name: body.name,
            slug: body.slug,
          }),
        });
      }
    });

    await page.route("**/api/v1/institutions/inst-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockInstitution),
      });
    });

    await page.route("**/api/v1/institutions/inst-1/members", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockMembers),
      });
    });
  });

  test("shows institution list", async ({ page }) => {
    await page.goto("/institutions");
    await expect(page.getByText("Universidad Nacional")).toBeVisible();
  });

  test("shows member count on card", async ({ page }) => {
    await page.goto("/institutions");
    await expect(page.getByText(/3/)).toBeVisible();
  });

  test("can navigate to institution detail", async ({ page }) => {
    await page.goto("/institutions");
    await page.getByText("Universidad Nacional").click();
    await page.waitForURL(/\/institutions\/inst-1/);
  });

  test("institution detail shows members", async ({ page }) => {
    await page.goto("/institutions/inst-1");
    await expect(page.getByText("admin@calificame.com")).toBeVisible();
    await expect(page.getByText("prof@calificame.com")).toBeVisible();
  });

  test("institution detail shows member roles", async ({ page }) => {
    await page.goto("/institutions/inst-1");
    await expect(page.getByText(/owner|propietario/i)).toBeVisible();
    await expect(page.getByText(/professor|profesor/i)).toBeVisible();
  });

  test("can open invite member dialog", async ({ page }) => {
    await page.goto("/institutions/inst-1");
    await page.getByRole("button", { name: /invitar|invite/i }).click();
    await expect(page.getByLabel(/correo|email/i)).toBeVisible();
  });

  test("invite member form has role selector", async ({ page }) => {
    await page.route("**/api/v1/institutions/inst-1/members/invite", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "inv-1",
          email: "new@test.com",
          role: "professor",
          status: "pending",
          created_at: "2025-06-01T00:00:00Z",
        }),
      });
    });

    await page.goto("/institutions/inst-1");
    await page.getByRole("button", { name: /invitar|invite/i }).click();
    await expect(page.getByLabel(/rol|role/i)).toBeVisible();
  });
});
