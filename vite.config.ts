import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({ base: './', plugins: [vue()], worker: { format: 'es' }, server: { host: '127.0.0.1' }, build: { manifest:true,rollupOptions:{input:{app:'index.html',login:'login.html'}},chunkSizeWarningLimit: 1100 } });
