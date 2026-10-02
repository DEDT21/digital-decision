import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    /* Gehashte Bundles (JS/CSS) landen unter /static/ und werden laut netlify.toml ein Jahr
       lang als immutable gecacht. /assets/ bleibt den Bildern aus public/ vorbehalten: die
       behalten ihre Dateinamen und bekommen deshalb nur einen Tag Cache. */
    assetsDir: 'static',
    /* Der SSR-Build fürs Prerendering (dist-ssr/) braucht nur das Node-Bundle, nicht public/. */
    copyPublicDir: !isSsrBuild,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        danke: resolve(import.meta.dirname, 'danke/index.html'),
        impressum: resolve(import.meta.dirname, 'impressum/index.html'),
        datenschutz: resolve(import.meta.dirname, 'datenschutz/index.html'),
        notFound: resolve(import.meta.dirname, '404.html')
      }
    }
  }
}));
