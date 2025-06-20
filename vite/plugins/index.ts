import type { Plugin } from 'vite';
import createCompression from './compression';
// import createSetupExtend from './setup-extend';

const createVitePlugins = (viteEnv, isBuild = false) => {
  const vitePlugins: Plugin[] = [];
  // vitePlugins.push(createSetupExtend());
  isBuild && vitePlugins.push(...createCompression(viteEnv));
  return vitePlugins;
};

export default createVitePlugins;
