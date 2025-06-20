<template>
  <div class="waterfall-wrap" ref="containerRef">
    <water-fall :gap="20" :column="column" :request="getData" :page-size="30" v-if="column">
      <template #item="{ item }">
        <el-image :src="item.url" alt="图片" class="image" lazy></el-image>
      </template>
    </water-fall>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import WaterFall from '@/components/List/WaterFall.vue';
import type { IImageItem } from '@/components/List/type';
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

const getData = (page: number, pageSize: number): Promise<IImageItem[]> => {
  return new Promise<IImageItem[]>(async resolve => {
    // 模拟请求
    const imageList: IImageItem[] = data.map((item: any) => ({
      id: Math.random().toString(36).substring(2, 9),
      url: PROD ? BASE_URL + item.url : item.url,
      height: item.height,
      width: item.width,
    }));
    resolve(imageList);
  });
};
</script>

<style scoped lang="scss">
.waterfall-wrap {
  padding: 0 16px;
  width: 100%;
  height: calc(100vh - 110px);
  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: OpatityAnimation 0.3s; // 添加动画，使其出现时更加丝滑
  }
}

@keyframes OpatityAnimation {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
