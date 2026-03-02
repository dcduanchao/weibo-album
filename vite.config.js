import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    base: env.VITE_BASE_URL,
    plugins: [vue()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      // proxy: {
      //   '/weibo': {
      //     target: 'http://192.168.90.161:8888',
      //     changeOrigin: true
      //   }
      // }
    }
  }
})
