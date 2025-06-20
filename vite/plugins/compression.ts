import type { Plugin } from 'vite';
import compression from 'vite-plugin-compression';

const createCompression = env => {
  const { VITE_BUILD_COMPRESS } = env;
  const compressList = VITE_BUILD_COMPRESS.split(',');
  const plugins: Plugin[] = [];
  if (compressList.includes('gzip')) {
    const compressionPlugin = compression({
      ext: '.gz',
      deleteOriginFile: false,
    });
    plugins.push(compressionPlugin);
  }
  if (compressList.includes('brotli')) {
    const compressionPlugin = compression({
      ext: '.br',
      algorithm: 'brotliCompress',
      deleteOriginFile: false,
    });
    plugins.push(compressionPlugin);
  }
  return plugins;
};

export default createCompression;
