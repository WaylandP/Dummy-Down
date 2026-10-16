import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vercel serves `404.html` from the output, with a 404 status, for any path
 * its rewrites do not name. A copy of the built entry document lets the app
 * boot there and show its own "This board is blank." page.
 */
function notFoundPage(): Plugin {
  let outDir = 'dist'
  return {
    name: 'cipher-and-chalk:not-found-page',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

export default defineConfig(({ mode }) => ({
  define:
    mode === 'test'
      ? {}
      : {
          'import.meta.env.VITE_USAGE_DEPLOYMENT': JSON.stringify(
            process.env.VERCEL_ENV ?? 'development',
          ),
        },
  plugins: [react(), tailwindcss(), notFoundPage()],
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    clearMocks: true,
    // A test that waits for a lazy page can need more than the five-second
    // default when the cores are busy; the long wait is in setup.ts.
    testTimeout: 15000,
  },
}))
