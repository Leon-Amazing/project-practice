<template>
  <div class="virtual-estimated-list-wrap">
    <virtual-estimated-list :data-source="dataSource" :loading="loading" loading-text="拼命加载中..." loading-bg="rgba(255, 255, 255, 0.8)" :estimated-height="80" @getData="getData">
      <template #item="{ item }">
        <div class="list-item">{{ item.id + 1 }} - {{ item.content }}</div>
      </template>
    </virtual-estimated-list>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Mock from 'mockjs';
import VirtualEstimatedList from '@/components/List/VirtualEstimatedList.vue';
import { delay } from '@/utils/utils';

const dataSource = ref<
  Array<{
    id: number;
    content: string;
  }>
>([]);

const loading = ref(false);

const getData = async () => {
  loading.value = true;
  await delay();
  const newData: any = [];
  for (let i = 0; i < 20; i++) {
    const len: number = dataSource.value.length + newData.length;
    newData.push({
      id: len,
      content: Mock.mock('@csentence(100, 800)'),
    });
  }
  dataSource.value = [...dataSource.value, ...newData];
  loading.value = false;
};

onMounted(() => {
  getData();
});
</script>

<style scoped lang="scss">
.virtual-estimated-list-wrap {
  padding: 0 16px;
  width: 100%;
  height: calc(100vh - 110px);
}
.list-item {
  border-bottom: 1px dashed #409eff;
  padding-bottom: 10px;
  letter-spacing: 0.1em;
  color: #409eff;
  background-color: #f5f7fa;
}
</style>
