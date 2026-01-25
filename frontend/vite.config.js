import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default defineConfig({
  plugins: [react()],
  preview: {port:1658, host:true},
  resolve: {
    alias: {
      '@components': path.resolve(dirname, './src/components'),
      '@hooks': path.resolve(dirname, './src/hooks'),
      '@context': path.resolve(dirname, './src/context'),
      '@pages': path.resolve(dirname, './src/pages'),
      '@services': path.resolve(dirname, './src/services'),
      '@styles': path.resolve(dirname, './src/styles'),
      '@assets': path.resolve(dirname, './src/assets'),
      '@helpers': path.resolve(__dirname, './src/helpers')
    }
  }
});
