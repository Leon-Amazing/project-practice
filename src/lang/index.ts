import en from './en';
import zhCn from './zh-cn';
import { createI18n } from 'vue-i18n';
import type { App } from 'vue';
const langStr = localStorage.getItem('cty-admin-lang') || '{}';
const langObj = JSON.parse(langStr);
const messages = {
  en,
  zhCn,
};

const localeData = {
  legacy: false,
  globalInjection: true, //全局生效$t
  locale: langObj.locale || 'zhCn', // 默认cn翻译
  messages,
};

export function setupI18n(app: App) {
  const i18n = createI18n(localeData);
  app.use(i18n);
}
