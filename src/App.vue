<template>
  <div class="app">
    <div class="nav-list">
      <div class="nav" :class="{ active: activeIndex === index }" :style="{ backgroundColor: item.bgColor }" v-for="(item, index) in navList" :key="item.id" @click="activeIndex = index">
        {{ item.name }}
      </div>
    </div>

    <div class="component-wrap" :class="{ 'list-container': navList[activeIndex].class }">
      <component :is="navList[activeIndex].component"></component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ListContainer from './views/list-container.vue';
import ListEstimatedContainer from './views/list-estimated-container.vue';
import WaterfallContainer from './views/waterfall-container.vue';
import WaterfallVirtualContainer from './views/waterfall-virtual-container.vue';
import { getRandomColor } from './utils/utils';

const activeIndex = ref(0);
const navList = [
  {
    id: 1,
    name: '定高虚拟列表',
    bgColor: getRandomColor(),
    component: ListContainer,
    class: 'list-container',
  },
  {
    id: 2,
    name: '不定高虚拟列表',
    bgColor: getRandomColor(),
    component: ListEstimatedContainer,
    class: 'list-container',
  },
  {
    id: 3,
    name: '瀑布流列表',
    bgColor: getRandomColor(),
    component: WaterfallContainer,
  },
  {
    id: 4,
    name: '瀑布流+虚拟列表',
    bgColor: getRandomColor(),
    component: WaterfallVirtualContainer,
  },
];
</script>

<style scoped lang="scss">
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  .nav-list {
    display: flex;
    .nav {
      padding: 4px 8px;
      border-radius: 2px;
      cursor: pointer;
      color: #ffffff;
      transition: all 0.3s;
      font-size: 14px;
      margin: 0 10px;
      &:hover {
        transform: scale(1.1);
      }
      &.active {
        transform: scale(1.1);
      }
    }
  }
  .component-wrap {
    width: 50vw;
    height: 80vh;
    &.list-container {
      width: 450px;
    }
  }
}
</style>
