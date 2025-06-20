<template>
  <div class="virtuallist-wrap">
    <virtual-list :data-source="state.dataSource" :item-height="100" :loading="state.loading" loading-text="拼命加载中..." loading-bg="rgba(255, 255, 255, 0.8)" @getData="getData">
      <template #item="{ item }">
        <div class="list-item">{{ item.id }}</div>
      </template>
    </virtual-list>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import VirtualList from '@/components/List/VirtualList.vue';
import { delay } from '@/utils/utils';

const state = reactive({
  dataSource: [] as Array<{ id: number }>,
  loading: false,
});

onMounted(() => {
  getData();
});

const getData = async () => {
  if (state.loading) return;
  state.loading = true;
  await delay();
  for (let i = 0; i < 10; i++) {
    const len = state.dataSource.length;
    state.dataSource.push({
      id: len + 1,
    });
  }
  state.loading = false;
};
</script>

<style scoped lang="scss">
.virtuallist-wrap {
  padding: 0 16px;
  width: 100%;
  height: calc(100vh - 110px);
  .list-item {
    width: 100%;
    height: 90px;
    box-sizing: border-box;
    text-align: center;
    line-height: 90px;
    font-size: 20px;
    background-color: #ecf5ff;
    color: #409eff;
  }
}
</style>
