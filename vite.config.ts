import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import createVitePlugins from './vite/plugins';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: process.env.NODE_ENV === 'production' ? '/project-practice/' : '',
    plugins: [vue(), ...createVitePlugins(env, command === 'build')],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        comps: resolve(__dirname, './src/components'),
        store: resolve(__dirname, './src/store'),
        '~': resolve(__dirname, './'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 4520,
      force: true,
      proxy: {
        // 选项写法
        '/base': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\//, ''),
        },
        '/manageapi': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\//, ''),
        },
      },
    },
  };
});
