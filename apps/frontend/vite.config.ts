import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@github-tracker/shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  },
  build: {sourcemap: true}
});
