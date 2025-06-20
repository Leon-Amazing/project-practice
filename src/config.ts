import { CUtil, Api, DateUtil } from 'cty-cms-ui';
import { useLangStore } from './store/lang';
import { useThemeStore } from './store/theme';
import { useI18n } from 'vue-i18n';
export const config = {
  // 是否需要多语言
  langSwitch: false,
  // 是否需要虚拟登录
  loginSwitch: true,
  // 是否用虚拟路由
  routerSwitch: true,
  /* 默认布局
   * 可选布局：
   * 1: 常规布局
   * 2: 纵向布局
   * 3: 横向布局
   * 4: 分栏布局
   * 5: 浮动布局
   */
  layout: 2,
  // 路由跳转方式 参数为name path
  routerMode: 'name',
  // 根目录重定向地址
  rootRedirect: '/Home',
};

export const langChangeFn = (language: string) => {
  const useLang = useLangStore();
  useLang.updateLang(language);
  const { locale } = useI18n();
  locale.value = language;
};

// 修改默认配置
export const useConfig = () => {
  // 修改密码加密的Md5Salt
  CUtil.basePwdMd5Salt = 'Md5Salt';

  //非预定义API的前缀, Api可在Api.ts中预定义, 也可不预定义, 不预定义时将会自动拼上此前缀
  Api.apiPrefix = 'manageapi';

  /* 修改默认语言
   * 可选语言：
   * en: 英语
   * zhCn: 中文
   */
  langChangeFn('zhCn');

  CUtil.httpFixedParams = { lang: CUtil.language };

  /* 修改默认主题
   * 可选主题：
   * blueWhite: 蓝白
   * blueBlack: 蓝黑
   * greenWhite: 绿白
   * greenBlack: 绿黑
   */
  const useTheme = useThemeStore();
  useTheme.changeTheme('blueWhite');

  //日期格式相关设置,一般不需要设, 不同语言已预设了格式,会随语言自动切换
  //DateUtil.defaultDateFormat = '';      //如: yyyy-MM-dd
  //DateUtil.defaultDateTimeFormat = '';  //如: yyyy-MM-dd HH:mm:ss
  //DateUtil.defaultTimeZone = '';   //一般不需要设置

  // 设置图标文件路径
  const iconFiles = import.meta.glob('../public/icon/*.svg', { eager: true });
  CUtil.defaultCustomIconList = iconFiles;

  // 设置图标文件路径
  CUtil.baseURL = import.meta.env.BASE_URL;
};
