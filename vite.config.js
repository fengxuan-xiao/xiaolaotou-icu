import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 确保引入了 path

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 关键配置
    }
  }
})
