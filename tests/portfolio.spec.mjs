import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function noHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () =>
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
      document.documentElement.clientWidth,
  );
  expect(overflow, 'Content should fit the viewport').toBeLessThanOrEqual(1);
}

async function capture(page, filename) {
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: `artifacts/${filename}.png`, fullPage: true });
}

test('desktop navigation, engineering summaries, and keyboard disclosures', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  for (const [name, hash] of [
    ['Work', 'work'],
    ['Expertise', 'skills'],
    ['About', 'about'],
    ['Let’s talk', 'contact'],
  ]) {
    await navigation.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${hash}$`));
    await expect(navigation.getByRole('link', { name, exact: true })).toHaveAttribute(
      'aria-current',
      'location',
    );
  }
  for (const name of ['TijarahJo', 'CarePoint']) {
    const project = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name, exact: true }) });
    await expect(project.locator('.engineering-highlight')).toBeVisible();
    const disclosure = project.locator('summary');
    await expect(project.locator('details')).not.toHaveAttribute('open');
    await disclosure.focus();
    await disclosure.press('Enter');
    await expect(project.locator('details')).toHaveAttribute('open', '');
    await disclosure.press('Enter');
    await expect(project.locator('details')).not.toHaveAttribute('open');
  }
  expect(errors).toEqual([]);
});

test('skip link reaches main content with the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Explore my work' })).toBeFocused();
});

test('copy email works and denied clipboard access has useful feedback', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#contact');
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.getByRole('status')).toHaveText('Email address copied to your clipboard.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('ZaidAsaireh@gmail.com');
  await context.clearPermissions();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Permission denied')) },
    });
  });
  await page.reload();
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.getByRole('status')).toContainText('Email selected.');
  expect(await page.evaluate(() => window.getSelection().toString())).toBe('ZaidAsaireh@gmail.com');
});

for (const [width, height] of [
  [320, 720],
  [360, 800],
  [390, 844],
  [620, 800],
  [621, 800],
  [768, 1024],
  [844, 390],
  [1440, 1000],
]) {
  test(`layout fits ${width} × ${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await noHorizontalOverflow(page);
    const image = page.locator('.hero-art img');
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0))
      .toBeTruthy();
    expect(await image.evaluate((element) => element.currentSrc)).toMatch(
      /connected-layers-(480|768|1024)\.avif$/,
    );
    if (width <= 620) {
      await page.getByRole('button', { name: 'Menu' }).click();
      await expect(
        page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Close', exact: true }).click();
    }
    // Reveal project cards before producing full-page visual review artifacts.
    await page.locator('#work').scrollIntoViewIfNeeded();
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.getByRole('link', { name: 'Back to top' }).click();
    await capture(page, `viewport-${width}x${height}`);
    if (width === 1440)
      await page.screenshot({ path: 'artifacts/portfolio-preview.jpg', type: 'jpeg', quality: 85 });
  });
}

test('mobile menu supports Escape, section focus, and orientation changes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  const navigation = page.getByRole('navigation');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(navigation.getByRole('link', { name: 'Work', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await navigation.getByRole('link', { name: 'About', exact: true }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#about')).toBeFocused();
  await toggle.click();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation.getByRole('link', { name: 'Work', exact: true })).toBeVisible();
  await noHorizontalOverflow(page);
});

for (const failure of ['disabled', 'blocked']) {
  test(`mobile navigation works with JavaScript ${failure}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      javaScriptEnabled: failure !== 'disabled',
    });
    const page = await context.newPage();
    if (failure === 'blocked') await page.route('**/script.js', (route) => route.abort());
    await page.goto('http://127.0.0.1:4173/');
    await expect(page.locator('.menu-toggle')).toBeHidden();
    const about = page.getByRole('navigation').getByRole('link', { name: 'About', exact: true });
    await expect(about).toBeVisible();
    await about.click();
    await expect(page).toHaveURL(/#about$/);
    await noHorizontalOverflow(page);
    await capture(page, `javascript-${failure}`);
    await context.close();
  });
}

test('200 percent text remains usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await noHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Let’s talk', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'ZaidAsaireh@gmail.com', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#contact').getByRole('link', { name: 'GitHub' })).toBeVisible();
  await noHorizontalOverflow(page);
  await capture(page, 'text-200-percent');
});

test('reduced motion avoids hero animations', async ({ page }) => {
  await page.goto('/');
  expect(
    await page
      .locator('.hero-content')
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
});
