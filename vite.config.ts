import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  define:
    mode === 'test'
      ? {}
      : {
          'import.meta.env.VITE_USAGE_DEPLOYMENT': JSON.stringify(
            process.env.VERCEL_ENV ?? 'development',
          ),
        },
  plugins: [react(), tailwindcss()],
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
