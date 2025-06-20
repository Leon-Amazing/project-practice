import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'cty-cms-ui/lib/style.css';
import './styles/index.scss';
import router, { setupRouter } from './router';
import { setupStore } from './store';
import CtyCmsUI from 'cty-cms-ui';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { initApi } from './api';
import { setupI18n } from './lang';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

import './permission';

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
initApi();
// 去掉Vue warn警告
app.config.warnHandler = () => null;
setupStore(app);
setupRouter(app);
setupI18n(app);
app.use(ElementPlus);
app.use(CtyCmsUI);
router.isReady().then(() => {
  app.mount('#app');
});
