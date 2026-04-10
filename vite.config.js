import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],

  server: {
    // Exposes the dev server to your local network.
    // This lets you access the app from your phone or other devices
    // on the same WiFi using your computer's IP address (e.g. http://192.168.1.xxx:5173).
    // Without this, only localhost (your own computer) can access the app.
    host: true,
    port: 5173,
  },
})
