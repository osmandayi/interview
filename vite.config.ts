/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
    globals: true,
    // Node 25+ kendi (dosyasız modda undefined olan) localStorage'ını global'e koyuyor
    // ve jsdom'unkini gölgeliyor; worker'larda kapatıyoruz.
    poolOptions: {
      forks: { execArgv: ['--no-experimental-webstorage'] },
      threads: { execArgv: ['--no-experimental-webstorage'] }
    }
  }
});
