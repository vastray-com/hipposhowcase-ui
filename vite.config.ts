import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import UnoCSS from 'unocss/vite'
import { defineConfig, loadEnv } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // eslint-disable-next-line node/prefer-global/process
  const env = loadEnv(mode, path.resolve(process.cwd(), './env'))
  console.info('当前环境变量:', env)

  return {
    base: env.VITE_BASE_PATH ?? '/',
    envDir: './env',
    plugins: [
      react(),
      UnoCSS(),
      svgr(),
      mkcert(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
