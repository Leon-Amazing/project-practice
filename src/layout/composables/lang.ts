import { ref, computed } from 'vue';
import { Language } from 'element-plus/es/locale';
import { useI18n } from 'vue-i18n';
import { useLangStore } from 'store/lang';
import { CUtil } from 'cty-cms-ui';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import en from 'element-plus/dist/locale/en.mjs';

export const useLayoutLang = () => {
  const useLang = useLangStore();
  const { locale } = useI18n();
  CUtil.language = useLang.locale || 'zhCn';
  const language = ref<string>('');
  if (useLang.locale === 'zhCn') {
    language.value = 'zh-cn';
  } else {
    language.value = useLang.locale || 'zh-cn';
  }
  const localeList = [zhCn, en];
  const elLocale = computed(() => {
    let locale: Language = { name: '', el: {} };
    localeList.forEach(item => {
      if (item.name === language.value) locale = item;
    });
    return locale;
  });
  const switchLang = (command: string) => {
    CUtil.language = command;
    locale.value = command;
    if (command === 'zhCn') {
      language.value = 'zh-cn';
    } else {
      language.value = command;
    }
    useLang.updateLang(command);
    location.reload();
  };

  return { language, elLocale, switchLang };
};
