import router, { constantRoutes, asyncRoutes } from './router';
import { useUserStore } from './store/user';
import { ElMessage } from 'element-plus';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useDynamicTitle } from './utils/dynamicTitle';
import { ValidateUtil, CtyRouterUtil } from 'cty-cms-ui';
const routeAllPath = import.meta.glob(`./pages/**/*.vue`);
const layoutPath = import.meta.glob(`./layout/**/*.vue`);
import { config } from './config';

// 设置路由跳转方式
CtyRouterUtil.routerMode = config.routerMode as 'name' | 'path';
// 设置根目录重定向
CtyRouterUtil.rootRedirect = config.rootRedirect;

NProgress.configure({
  showSpinner: false,
});

const whiteList = ['/login', '/404', '/401'];

const routerApi = () => {
  return {
    code: 0,
    data: {
      dictionaries: [],
      navigations: asyncRoutes,
      userInfo: { userId: 1, username: 'admin', nickName: 'admin', orgid: 0, orgName: '', instid: '', instName: '', roles: ['admin'], avatar: '', sex: 1, phone: '', email: '', title: '' },
    },
    effectCount: 0,
  };
};

router.beforeEach((to, from, next) => {
  NProgress.start();
  const useUser = useUserStore();
  if (useUser.isLogin()) {
    useDynamicTitle(to.meta.title as string);
    if (to.path === '/login') {
      next({
        path: '/',
      });
      NProgress.done();
    } else {
      if (useUser.roles.length === 0) {
        CtyRouterUtil.generateRoutes(layoutPath, routeAllPath, constantRoutes, config.routerSwitch ? routerApi : undefined)
          .then((result: any) => {
            useUser.setInfo(result.userInfo);
            result.accessRoutes.forEach((route: any) => {
              if (!ValidateUtil.isHttp(route.path) && route.component) router.addRoute(route);
            });
            next({ ...to, replace: true });
          })
          .catch((err: any) => {
            ElMessage.error(err);
            NProgress.done();
            useUser.logOut();
          });
      } else {
        next();
        NProgress.done();
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      // 在白名单里直接进入
      next();
      NProgress.done();
    } else {
      next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
      NProgress.done();
    }
  }
});
