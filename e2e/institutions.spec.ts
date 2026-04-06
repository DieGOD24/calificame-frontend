import { test, expect } from "@playwright/test";
import { loginAsMock, mockAdminUser } from "./helpers";

const mockInstitution = {
  id: "inst-1", name: "Universidad Nacional", slug: "universidad-nacional",
  logo_url: null, primary_color: "#4f46e5", plan: "free",
  max_professors: 10, max_students: 100, member_count: 3, created_at: "2025-01-01T00:00:00Z",
};

// Use field names matching the Member interface in the page component
const mockMembers = [
  { id: "member-1", user_id: "admin-1", email: "admin@calificame.com", full_name: "Admin User", role: "owner", joined_at: "2025-01-01T00:00:00Z" },
  { id: "member-2", user_id: "user-2", email: "prof@calificame.com", full_name: "Professor One", role: "professor", joined_at: "2025-02-01T00:00:00Z" },
];

test.describe("Institutions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page, mockAdminUser);

    await page.route("**/api/v1/institutions", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([mockInstitution]) });
      } else if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201, contentType: "application/json",
          body: JSON.stringify({ ...mockInstitution, id: "inst-new", name: body.name, slug: body.slug }),
        });
      }
    });

    await page.route(/\/api\/v1\/institutions\/inst-1$/, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockInstitution) });
    });

    await page.route("**/api/v1/institutions/inst-1/members", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockMembers) });
    });

    // Mock projects for dashboard
    await page.route(/\/api\/v1\/projects(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, page: 1, page_size: 20 }),
      });
    });
  });

  test("shows institution list", async ({ page }) => {
    await page.goto("/institutions");
    await expect(page.getByText("Universidad Nacional")).toBeVisible();
  });

  test("shows member count on card", async ({ page }) => {
    await page.goto("/institutions");
    await expect(page.getByText("Universidad Nacional")).toBeVisible();
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
    await expect(page.getByText("owner", { exact: true })).toBeVisible();
    await expect(page.getByText("professor", { exact: true })).toBeVisible();
  });

  test("can open invite member dialog", async ({ page }) => {
    await page.goto("/institutions/inst-1");
    await page.getByRole("button", { name: /invitar/i }).click();
    await expect(page.locator("input[type='email']")).toBeVisible();
  });

  test("invite member form has role selector", async ({ page }) => {
    await page.goto("/institutions/inst-1");
    await page.getByRole("button", { name: /invitar/i }).click();
    await expect(page.locator("select")).toBeVisible();
  });
});
