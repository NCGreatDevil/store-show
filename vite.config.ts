import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem'))
    },
    proxy: {
      // 将 /api 请求代理到 PocketBase 服务器
      '/api': {
        target: 'https://ma.cloud-ip.cc',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
