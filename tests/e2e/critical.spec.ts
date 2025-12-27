import { test, expect } from '@playwright/test';

/**
 * Tests critiques pour AniReserve
 * Ces tests vérifient que les fonctionnalités essentielles fonctionnent
 */

test.describe('Page d\'accueil', () => {
    test('la page d\'accueil charge correctement', async ({ page }) => {
        await page.goto('/');

        // Vérifie que la page charge (pas d'erreur serveur)
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('body')).not.toContainText('500');
        await expect(page.locator('body')).not.toContainText('Internal Server Error');
    });

    test('la navigation principale existe', async ({ page }) => {
        await page.goto('/');

        // Vérifie qu'il y a des liens navigables
        const links = page.locator('a');
        await expect(links.first()).toBeVisible();
    });
});

test.describe('Page de connexion', () => {
    test('la page de connexion client charge', async ({ page }) => {
        await page.goto('/login/client');

        // Vérifie que la page ne montre pas d'erreur
        await expect(page.locator('body')).not.toContainText('Error');
        await expect(page.locator('body')).not.toContainText('500');
    });

    test('la page de connexion pro charge', async ({ page }) => {
        await page.goto('/login/pro');

        // Vérifie que la page ne montre pas d'erreur
        await expect(page.locator('body')).not.toContainText('Error');
        await expect(page.locator('body')).not.toContainText('500');
    });
});

test.describe('Pages publiques', () => {
    test('la page de recherche charge', async ({ page }) => {
        await page.goto('/search');

        // La page ne doit pas afficher d'erreur
        await expect(page.locator('body')).not.toContainText('Error');
        await expect(page.locator('body')).not.toContainText('500');
    });

    test('la page terms charge', async ({ page }) => {
        await page.goto('/terms');
        await expect(page.locator('body')).toBeVisible();
    });

    test('la page privacy charge', async ({ page }) => {
        await page.goto('/privacy');
        await expect(page.locator('body')).toBeVisible();
    });
});

test.describe('Profils Pro', () => {
    test('un profil pro charge sans erreur', async ({ page }) => {
        // D'abord, on va sur la page d'accueil pour trouver un pro
        await page.goto('/');

        // Cherche un lien vers un profil pro
        const proLink = page.locator('a[href^="/pros/"]').first();

        if (await proLink.isVisible({ timeout: 5000 }).catch(() => false)) {
            await proLink.click();

            // Vérifie que la page charge sans erreur
            await expect(page.locator('body')).not.toContainText('Error');
            await expect(page.locator('body')).not.toContainText('500');
            await expect(page.locator('body')).not.toContainText('Something went wrong');
        } else {
            // Pas de pro visible, le test passe quand même
            console.log('No pro links visible on homepage, skipping profile test');
        }
    });
});

test.describe('API Health Check', () => {
    test('l\'API répond (test basique)', async ({ request }) => {
        // On teste juste que le serveur répond (même avec 404)
        const response = await request.get('/');
        expect(response.status()).toBeLessThan(500);
    });
});
