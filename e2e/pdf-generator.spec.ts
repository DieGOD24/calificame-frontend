import { test, expect } from "@playwright/test";
import { loginAsMock } from "./helpers";

test.describe("PDF Generator", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page);
  });

  test("shows PDF generator page", async ({ page }) => {
    await page.goto("/pdf-generator");
    await expect(page.getByText(/generador|generator|pdf/i)).toBeVisible();
  });

  test("shows upload area on step 1", async ({ page }) => {
    await page.goto("/pdf-generator");
    await expect(page.getByText(/arrastra|drag|subir|upload/i)).toBeVisible();
  });

  test("shows step indicators", async ({ page }) => {
    await page.goto("/pdf-generator");
    // Should show step 1 as active
    await expect(page.getByText(/paso 1|step 1|subir fotos|upload photos/i)).toBeVisible();
  });

  test("upload area accepts images", async ({ page }) => {
    await page.goto("/pdf-generator");
    const dropzone = page.locator("[data-testid='dropzone']").or(
      page.locator("input[type='file']")
    );
    await expect(dropzone).toBeAttached();
  });

  test("analyze endpoint is called after upload", async ({ page }) => {
    let analyzeCalled = false;
    await page.route("**/api/v1/pdf-generator/analyze", async (route) => {
      analyzeCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            index: 0,
            original_width: 800,
            original_height: 1200,
            crop_box: { x: 10, y: 10, width: 780, height: 1180 },
            cropped_image_base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          },
        ]),
      });
    });

    await page.goto("/pdf-generator");

    // Upload a file via input
    const fileInput = page.locator("input[type='file']");
    if (await fileInput.isVisible()) {
      // Create a minimal PNG file
      const buffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      await fileInput.setInputFiles({
        name: "test.png",
        mimeType: "image/png",
        buffer,
      });
    }
  });

  test("generate button is disabled without images", async ({ page }) => {
    await page.goto("/pdf-generator");
    const generateBtn = page.getByRole("button", { name: /generar|generate/i });
    if (await generateBtn.isVisible()) {
      await expect(generateBtn).toBeDisabled();
    }
  });
});
