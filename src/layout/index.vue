<template>
  <el-config-provider :locale="elLocale">
    <div class="cty-admin-wrapper">
      <cty-layout
        :key="language"
        :layout="layout"
        :collapse="isCollapse"
        :type="type"
        :header-option="headerOption"
        :side-bar-top="sideBarTop"
        :show-collapse="isShowCollapse"
        :side-bar-option="menuOptions"
        :tabs-option="tabsOption"
        :logo-option="logoOption"
        :router-mode="config.routerMode"
        @user-menu-click="userMenuClick"
        ref="ctyLayoutRef">
        <template #hRight v-if="config.langSwitch">
          <el-dropdown @command="switchLang">
            <span class="cty-header_icon">
              <cty-icon name="cty-language"></cty-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zhCn">中文简体</el-dropdown-item>
                <el-dropdown-item command="en">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <app-main></app-main>
      </cty-layout>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { CtyLayout, CtyIcon } from 'cty-cms-ui';
import AppMain from './components/AppMain.vue';
import { config } from '../config';
import { ref, provide } from 'vue';
import { useLayoutLang } from './composables/lang';
import { useLayout } from './composables/layout';
import { useTheme } from './composables/theme';
import { useSetting } from './composables/setting';
import { useMenu } from './composables/menu';

// 语言修改
const { language, elLocale, switchLang } = useLayoutLang();
// 配置和用户信息
const { headerOption, userMenuClick, logoOption } = useSetting();
// 布局改变
const { layout, isCollapse, type, isShowCollapse, sideBarTop } = useLayout();
// 主题改变
useTheme();
// tab列表和菜单
const { menuOptions, tabsOption, setNavBadge } = useMenu();

// 布局修改的参数
const layoutChange = (value: number) => {
  switch (value) {
    case 1:
      // 常规布局
      layout.value = 'vertical';
      sideBarTop.value = false;
      isCollapse.value = false;
      type.value = `normal`;
      isShowCollapse.value = true;
      headerOption.showHeaderLogo = true;
      menuOptions.showLogo = false;
      break;
    case 2:
      // 纵向布局
      layout.value = 'vertical';
      headerOption.showHeaderLogo = false;
      menuOptions.showLogo = true;
      sideBarTop.value = true;
      isCollapse.value = false;
      type.value = `normal`;
      isShowCollapse.value = true;
      break;
    case 3:
      // 横向布局
      layout.value = 'horizontal';
      headerOption.showHeaderLogo = false;
      menuOptions.showLogo = true;
      sideBarTop.value = true;
      isCollapse.value = false;
      type.value = `normal`;
      isShowCollapse.value = true;
      break;
    case 4:
      // 分栏布局
      layout.value = 'vertical';
      headerOption.showHeaderLogo = false;
      menuOptions.showLogo = true;
      sideBarTop.value = true;
      isCollapse.value = false;
      type.value = `column`;
      isShowCollapse.value = true;
      break;
    case 5:
      // 浮动布局
      layout.value = 'vertical';
      headerOption.showHeaderLogo = false;
      menuOptions.showLogo = true;
      sideBarTop.value = true;
      isCollapse.value = true;
      type.value = `normal`;
      isShowCollapse.value = false;
      break;
  }
};
layoutChange(config.layout);
const ctyLayoutRef = ref();
provide('ctyLayoutRef', ctyLayoutRef);
provide('setNavBadge', setNavBadge);
</script>

<style lang="scss">
.cty-admin-wrapper {
  .cty-layout__main {
    padding: 0 !important;
  }
}

.cty-layout__form-label {
  .el-icon {
    color: #ffa500;
    cursor: pointer;
    position: relative;
    top: 2px;
  }
  &.w150 {
    width: 150px;
  }
}

.el-popper.is-customized {
  padding: 6px 12px;
  background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
  color: rgb(92, 87, 87);
}

.el-popper.is-customized .el-popper__arrow::before {
  background: linear-gradient(45deg, #b2e68d, #bce689);
  right: 0;
}
</style>
