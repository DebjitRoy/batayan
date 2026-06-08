import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'https://majestic-olympic-82789.herokuapp.com',
        target: 'https://tch4co3oq4.execute-api.us-east-1.amazonaws.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts'
  }
});
