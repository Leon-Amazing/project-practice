import { Api, HttpUtil } from 'cty-cms-ui';
import { useUserStore } from '../store/user';

let domainDef: string = '/';

const { VITE_API_URL, VITE_USE_PROXY } = import.meta.env;

// 不使用代理
if (VITE_USE_PROXY === '0') {
  domainDef = VITE_API_URL;
}

const postApiList = {
  home: {
    Login: 'xxx/home/Login', //登录
  },
};

const getApiList = {};

export const initApi = () => {
  HttpUtil.apiBaseURL = domainDef;
  HttpUtil.setErrorHandler((response: any) => {
    const { data } = response;
    const userStore = useUserStore();
    if (data && data.code === 401) {
      userStore.logOut(true);
    }
  });
  Api.setApiList(postApiList, 'post');
  Api.setApiList(getApiList, 'get');
};
