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
  },
}))
