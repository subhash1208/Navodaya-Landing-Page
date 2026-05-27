import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
    // Wait for the contact section to be visible
    await page.waitForSelector('#contact', { state: 'visible' });
  });

  test('form is visible with all required fields', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
    // Check key form fields exist
    await expect(page.locator('input[name="companyName"], [name="companyName"]')).toBeVisible();
    await expect(page.locator('input[name="companyEmail"], [name="companyEmail"]')).toBeVisible();
  });

  test('form shows validation error on empty submit', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should show some error indication (browser native or custom)
      // The form uses required fields, so browser will block submission
      await page.waitForTimeout(500);
      // Page should still be on the same URL (form didn't submit)
      await expect(page).toHaveURL(/\/#contact/);
    }
  });

  test('form submits successfully with valid data', async ({ page }) => {
    // Fill in all required fields
    await page.fill('input[name="companyName"], [name="companyName"]', 'Test Hospital');
    await page.fill('input[name="companyEmail"], [name="companyEmail"]', 'test@hospital.com');
    await page.fill('input[name="contactPersonName"], [name="contactPersonName"]', 'Dr. Smith');
    await page.fill(
      'input[name="contactPersonNumber"], [name="contactPersonNumber"]',
      '+91 98765 43210',
    );
    await page.fill('input[name="quantity"], [name="quantity"]', '1000 pieces');

    // Select a product if there's a select/dropdown
    const productSelect = page.locator('select[name="productName"], [name="productName"]');
    if (await productSelect.isVisible()) {
      await productSelect.selectOption({ index: 1 });
    }

    // Submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for success state (the form shows a success message)
    await expect(page.locator('text=/thank|success|sent|received/i')).toBeVisible({
      timeout: 10000,
    });
  });
});
