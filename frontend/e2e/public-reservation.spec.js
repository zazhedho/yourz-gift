import { expect, test } from '@playwright/test'

test('public gift page renders list and opens reservation form', async ({ page }) => {
  await page.route('**/api/public/gift-lists/ABC123', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'ok',
        data: {
          id: 'list-1',
          title: 'Birthday Gift List',
          description: 'Pick one useful gift.',
          occasion_type: 'birthday',
          share_code: 'ABC123',
          cover_image_url: '',
          shipping_note: '',
          visibility: 'public',
          reservation_visibility: 'immediately',
          is_active: true,
        },
      }),
    })
  })

  await page.route('**/api/public/gift-lists/ABC123/items', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'ok',
        data: [{
          id: 'item-1',
          list_id: 'list-1',
          name: 'Coffee Grinder',
          description: 'Manual grinder',
          product_url: 'https://example.com',
          image_url: '',
          price: 250000,
          currency: 'IDR',
          quantity: 1,
          quantity_remaining: 1,
          priority: 1,
          is_active: true,
          is_archived: false,
          can_reserve: true,
        }],
      }),
    })
  })

  await page.goto('/g/ABC123')
  await expect(page.getByText('Birthday Gift List')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Coffee Grinder' })).toBeVisible()
  await page.getByRole('button', { name: 'Reserve' }).click()
  await expect(page.getByRole('dialog', { name: 'Reserve Coffee Grinder' })).toBeVisible()
})
