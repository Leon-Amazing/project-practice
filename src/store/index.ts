import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import type { App } from 'vue';

const store = createPinia();
store.use(piniaPluginPersistedstate);

export const setupStore = (app: App<Element>) => {
  app.use(store);
};

export default store;
