import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../store/user';
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
export const useSetting = () => {
  const { t } = useI18n();
  const router = useRouter();
  const userStore = useUserStore();
  const logoOption = reactive({
    text: '项目实践',
    icon: '/images/logo.png',
  });
  const headerOption = reactive({
    showHeaderLogo: false,
    nickname: 'admin',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    showBreadcrumb: true,
    userMenuList: [
      {
        icon: 'User',
        text: '个人中心',
        action: 'mine',
      },
      {
        icon: 'SwitchButton',
        text: '退出登录',
        action: 'logout',
      },
    ],
    separatorIcon: ArrowRight,
  });
  const userMenuClick = (action: string) => {
    if (action === 'logout') {
      userStore.logOut(true);
    }
    if (action === 'mine') {
      router.push({
        name: 'Personal',
      });
    }
  };

  return {
    headerOption,
    logoOption,
    userMenuClick,
  };
};
