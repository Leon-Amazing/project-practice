<template>
  <section class="app-main">
    <!-- :key="route.fullPath"，说明：如果需要使用keep-alive，需移除:key="route.fullPath"，且在导航管理配置的需要缓存对应字段设为true，
      缓存的页面需设置name，页面name的值需和导航管理配置的路径对应字段保持一致-->
    <router-view v-slot="{ Component, route }" :key="route.fullPath">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cacheRoutes">
          <component :is="Component" :key="route.path"></component>
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>
<script lang="ts">
export default {
  name: 'AppMain',
};
</script>
<script setup lang="ts" name="AppMain">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { CtyRouterUtil } from 'cty-cms-ui';

const route = useRoute();
const cacheRoutes = computed(() => {
  return CtyRouterUtil.cacheRoutes;
});
</script>

<style lang="scss" scoped>
.app-main {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f5f7fa;
}
</style>
