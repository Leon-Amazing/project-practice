declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'element-plus/dist/locale/zh-cn.mjs';
declare module 'element-plus/dist/locale/en.mjs';
declare module 'nprogress';
declare module 'blueimp-md5';
declare module 'js-cookie';
