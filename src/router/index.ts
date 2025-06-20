import { createRouter, createWebHashHistory } from 'vue-router';
import type { App } from 'vue';

export const constantRoutes = [
  { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue') },
  {
    path: '/401',
    name: '401',
    component: () => import('@/pages/401.vue'),
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/pages/404.vue'),
  },
];

export const asyncRoutes = [
  {
    title: '首页',
    icon: 'homeFilled',
    action: 'Home',
    hasChildren: false,
    actionType: 'route',
    file_path: '/pages/Home',
    badge: null,
    dot: false,
    hidden: false,
    _fixed: true,
    no_cache: false,
    redirect: null,
    isFolder: false,
  },
  {
    title: '数据大屏',
    icon: 'Histogram',
    action: 'dataOverview',
    hasChildren: false,
    actionType: 'route',
    file_path: '/pages/dataOverview/index',
    badge: null,
    dot: false,
    hidden: false,
    _fixed: false,
    no_cache: false,
    redirect: null,
    isFolder: false,
  },
  {
    title: '列表渲染',
    icon: 'List',
    action: 'List',
    hasChildren: true,
    actionType: 'route',
    file_path: 'Layout',
    badge: null,
    dot: false,
    hidden: false,
    _fixed: false,
    no_cache: false,
    redirect: null,
    isFolder: false,
    children: [
      {
        title: '定高虚拟列表',
        icon: 'Menu',
        action: 'listContainer',
        hasChildren: false,
        actionType: 'route',
        children: [],
        file_path: '/pages/listRendering/listContainer',
        badge: null,
        dot: false,
        hidden: false,
        _fixed: false,
        no_cache: false,
        redirect: null,
        isFolder: false,
      },
      {
        title: '不定高虚拟列表',
        icon: 'Menu',
        action: 'listEstimatedContainer',
        hasChildren: false,
        actionType: 'route',
        children: [],
        file_path: '/pages/listRendering/listEstimatedContainer',
        badge: null,
        dot: false,
        hidden: false,
        _fixed: false,
        no_cache: false,
        redirect: null,
        isFolder: false,
      },
      {
        title: '瀑布流列表',
        icon: 'Menu',
        action: 'waterfallContainer',
        hasChildren: false,
        actionType: 'route',
        children: [],
        file_path: '/pages/listRendering/waterfallContainer',
        badge: null,
        dot: false,
        hidden: false,
        _fixed: false,
        no_cache: false,
        redirect: null,
        isFolder: false,
      },
      {
        title: '瀑布流+虚拟列表',
        icon: 'Menu',
        action: 'waterfallVirtualContainer',
        hasChildren: false,
        actionType: 'route',
        children: [],
        file_path: '/pages/listRendering/waterfallVirtualContainer',
        badge: null,
        dot: false,
        hidden: false,
        _fixed: false,
        no_cache: false,
        redirect: null,
        isFolder: false,
      },
    ],
  },
  {
    title: '个人中心',
    icon: 'personal',
    action: 'Personal',
    hasChildren: false,
    actionType: 'route',
    file_path: '/pages/personalCenter/index',
    badge: null,
    dot: false,
    hidden: true,
    _fixed: false,
    no_cache: false,
    redirect: null,
    isFolder: false,
  },
];

const router = createRouter({
  // createWebHashHistory (hash路由) #/
  // createWebHistory (history路，需要服务器配置支持) /
  // createMemoryHistory 带缓存 history 路由
  // 添加baseUrl，createWebHistory(baseUrl)
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior: 'smooth' };
  },
});

export default router;

export const setupRouter = (app: App<Element>) => {
  app.use(router);
};
