import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => {
    return {
      theme: 'blueWhite',
    };
  },
  actions: {
    changeTheme(theme: string) {
      this.theme = theme;
    },
  },
  persist: {
    key: 'cty-admin-theme',
    storage: localStorage,
  },
});
