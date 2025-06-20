import { defineStore } from 'pinia';

const langStr = localStorage.getItem('cty-admin-lang') || '{}';
const langObj = JSON.parse(langStr);
export const useLangStore = defineStore('lang', {
  state: () => {
    return {
      locale: langObj.locale || 'zhCn',
    };
  },
  actions: {
    updateLang(locale: string) {
      this.locale = locale;
    },
  },
  persist: {
    key: 'cty-admin-lang',
    storage: localStorage,
  },
});
