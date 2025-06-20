<script setup lang="ts" name="App">
import { provide, ref, nextTick } from 'vue';
import { useLangStore } from './store/lang';
import { useConfig } from './config';
import { useLayoutLang } from './layout/composables/lang';

useConfig();
const { elLocale } = useLayoutLang();
const useLang = useLangStore();

const showPage = ref<boolean>(true);
const onRefresh = () => {
  showPage.value = false;
  nextTick(() => {
    showPage.value = true;
  });
};
provide('reload', onRefresh);
</script>

<template>
  <el-config-provider :locale="elLocale">
    <router-view :key="useLang.locale" v-if="showPage"></router-view>
  </el-config-provider>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
