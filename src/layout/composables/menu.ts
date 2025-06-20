import { reactive } from 'vue';
import { CtyRouterUtil } from 'cty-cms-ui';

export const useMenu = () => {
  const tabsOption = reactive<any>({
    showTabsActionMenu: true,
    type: 'smooth',
  });
  const menuHandle = (sidebarroutes: any, action = '') => {
    return sidebarroutes.map((route: any) => {
      if (route.meta) {
        const isLayout = route.component
          ? route.component?.name.includes(`${CtyRouterUtil.prefix}layout/index.vue`) || route.component?.name.includes(`${CtyRouterUtil.prefix}layout/EmptyLayout.vue`)
          : false;
        let obj: any = { ...route.meta };
        if (route.children && route.children.length > 0 && isLayout) {
          obj.hasChildren = true;
          obj.children = menuHandle(route.children, obj.action);
        } else {
          obj.hasChildren = false;
        }
        return obj;
      }
    });
  };
  let menuList = menuHandle(CtyRouterUtil.sidebarRouters).filter((item: any) => item);
  const menuOptions = reactive<any>({
    showLogo: true,
    columnStyle: 'vertical',
    list: [],
    props: {
      isHotSpot: 'dot',
    },
  });
  (menuOptions.list as any).push(...menuList);

  function setNavBadge(data: { [key: string]: any }, navList: any = null) {
    Object.keys(data).forEach((key: string) => {
      for (const nav of navList ?? menuOptions.list) {
        if (nav.action == key) {
          nav.badge = data[key];
          break;
        }
        if (nav.children) {
          setNavBadge(data, nav.children);
        }
      }
    });
  }
  return {
    menuOptions,
    tabsOption,
    setNavBadge,
  };
};
