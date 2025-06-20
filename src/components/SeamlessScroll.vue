<template>
  <div class="seamless-scroll-wrap" v-if="data && data.length">
    <div class="log-header">
      <span>名字</span>
      <span>分类</span>
      <span>地区</span>
    </div>
    <div class="infinite-list-wrapper">
      <vue3-seamless-scroll :is="componentName" class="infinite-list-body" :list="data" :wheel="true" :hover="true" :step="0.5">
        <li v-for="item in data" :key="item" class="infinite-list-item">
          <span>{{ item.name }}</span>
          <span>{{ item.category }}</span>
          <span>{{ item.county }}</span>
        </li>
      </vue3-seamless-scroll>
    </div>
  </div>
</template>
<script setup lang="ts" name="SeamlessScroll">
import { delay } from '@/utils/utils';
import { ref, onMounted } from 'vue';
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
const data: any = ref([]);
const componentName = data.value && data.value.length > 3 ? 'vue3-seamless-scroll' : 'div';
const props = defineProps({
  type: {
    type: Number,
    default: 1,
  },
});
async function getData() {
  data.value = [
    {
      id: 1,
      name: '名字1',
      category: '分类1',
      county: '地区1',
    },
    {
      id: 2,
      name: '名字2',
      category: '分类2',
      county: '地区2',
    },
    {
      id: 3,
      name: '名字3',
      category: '分类3',
      county: '地区3',
    },
    {
      id: 4,
      name: '名字4',
      category: '分类4',
      county: '地区4',
    },
    {
      id: 5,
      name: '名字5',
      category: '分类5',
      county: '地区5',
    },
    {
      id: 6,
      name: '名字6',
      category: '分类6',
      county: '地区6',
    },
    {
      id: 7,
      name: '名字7',
      category: '分类7',
      county: '地区7',
    },
    {
      id: 8,
      name: '名字8',
      category: '分类8',
      county: '地区8',
    },
    {
      id: 9,
      name: '名字9',
      category: '分类9',
      county: '地区9',
    },
    {
      id: 10,
      name: '名字10',
      category: '分类10',
      county: '地区10',
    },
  ];
  console.log(data.value, 'data.value');
}

defineExpose({
  getData,
});

onMounted(async () => {
  await delay(300);
  getData();
});
</script>
<style scoped lang="scss">
.seamless-scroll-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}
.log-header {
  width: 100%;
  font-size: 14px;
  color: #ffffff;
  line-height: 20px;
  padding: 12px 0 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  & > span {
    flex-shrink: 0;
    width: 20%;
    padding-left: 20px;
    text-align: left;
    font-weight: bold;
    &:first-child {
      width: 60%;
    }
  }
}
.infinite-list-wrapper {
  height: calc(100% - 49px);
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-size: 14px;
}
.infinite-list {
  width: 100%;
  list-style: none;
  font-size: 14px;
}

.infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  & > span {
    flex-shrink: 0;
    width: 20%;
    padding-left: 20px;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(255, 255, 255, 0.8);
    &:first-child {
      width: 60%;
    }
  }
}
</style>
