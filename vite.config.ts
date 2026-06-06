import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
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
