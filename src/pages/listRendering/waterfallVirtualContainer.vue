<template>
  <div class="waterfall-virtual-wrap" ref="containerRef">
    <water-fall-virtual :request="getData" :gap="15" :column="column" :request-size="30" v-if="column">
      <template #item="{ item }">
        <img class="test-item" :src="item.src" />
      </template>
    </water-fall-virtual>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import WaterFallVirtual from '@/components/List/WaterFallVirtual.vue';
import data from '@/assets/water-fall.json';

const column = ref(0);
const containerRef = ref<HTMLDivElement | null>(null);
const containerObserver = new ResizeObserver(entries => {
  changeColumn(entries[0].target.clientWidth);
});

const changeColumn = (width: number) => {
  if (width >= 960) {
    column.value = 6;
  } else if (width >= 690 && width < 960) {
    column.value = 5;
  } else if (width >= 500 && width < 690) {
    column.value = 4;
  } else {
    column.value = 2;
  }
};

onMounted(() => {
  containerRef.value && containerObserver.observe(containerRef.value);
});

onUnmounted(() => {
  containerRef.value && containerObserver.unobserve(containerRef.value);
});

const { BASE_URL, PROD } = import.meta.env;

const getData = async (page: number, pageSize: number) => {
  // 模拟请求
  const imageList = data.map((item: any) => ({
    id: Math.random().toString(36).substring(2, 9),
    src: PROD ? BASE_URL + item.url : item.url,
    height: item.height,
    width: item.width,
  }));

  return {
    total: 6000,
    list: imageList,
  };
};
</script>

<style scoped lang="scss">
.waterfall-virtual-wrap {
  padding: 0 16px;
  width: 100%;
  height: calc(100vh - 110px);
}
.test-item {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  animation: OpatityMoveAnimation 0.3s;
}
@keyframes OpatityMoveAnimation {
  from {
    opacity: 0;
    transform: translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
