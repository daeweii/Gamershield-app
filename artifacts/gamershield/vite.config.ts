import { copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import { appRoutes } from './src/lib/platform/registry.ts';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

// Content Security Policies, added to built pages only (the dev server relies
// on inline scripts). A CSP tells the browser exactly what a page may load and
// where it may send data, so even injected code can't reach anywhere else.

// Password generator: no outside connections at all, so a password can't leave.
const GENERATOR_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

// Main site: the same lockdown, plus the three services Sentrix uses (see SECURITY.md).
const SITE_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  // Radix dialogs inject a small <style> tag to lock page scrolling. Inline
  // styles can change looks but can't run code; scripts stay 'self' only.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://api.pwnedpasswords.com https://cloudflare-dns.com https://api.ipify.org",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

function securityHeaders(): Plugin {
  return {
    name: 'sentrix-csp',
    apply: 'build',
    transformIndexHtml(_html, ctx) {
      const csp = ctx.path.endsWith('/generator/index.html') ? GENERATOR_CSP : SITE_CSP;
      return [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' }];
    },
  };
}

// GitHub Pages serves only real files. The app is one page that routes in the
// browser, so the build writes a copy of index.html at every known route
// (e.g. settings/index.html) so deep links load with a 200 status. 404.html
// catches anything else. (Replit already rewrites unknown paths to index.html.)
function routePages(): Plugin {
  let outDir = '';
  return {
    name: 'sentrix-route-pages',
    apply: 'build',
    configResolved(config) { outDir = config.build.outDir; },
    closeBundle() {
      const index = path.join(outDir, 'index.html');
      if (!existsSync(index)) return;
      for (const route of appRoutes()) {
        if (route === '/') continue;
        const dir = path.join(outDir, route);
        mkdirSync(dir, { recursive: true });
        copyFileSync(index, path.join(dir, 'index.html'));
      }
      copyFileSync(index, path.join(outDir, '404.html'));
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    securityHeaders(),
    routePages(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    rollupOptions: {
      // Two pages: the main site and the standalone password generator.
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        generator: path.resolve(import.meta.dirname, 'generator/index.html'),
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
