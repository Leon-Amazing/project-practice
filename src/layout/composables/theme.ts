import { themeUtil } from 'cty-cms-ui';
import { useThemeStore } from 'store/theme';

export const useTheme = () => {
  const useTheme = useThemeStore();
  const themeChange = (value: string) => {
    useTheme.changeTheme(value);
    let theme: any;
    themeUtil.themeList.forEach((item: any) => {
      if (item.name === value) theme = item.theme;
    });
    themeUtil.changeTheme(theme);
  };
  themeChange(useTheme.theme);
  const setColor = (prop: string, value: string) => {
    themeUtil.setCssVar(prop, value);
  };
  return {
    themeChange,
    setColor,
  };
};
