<template>
  <div class="virtuallist-container" v-loading="props.loading" :element-loading-text="props.loadingText" :element-loading-background="props.loadingBg">
    <div class="virtuallist-content" ref="contentRef">
      <div class="virtuallist-list" :style="scrollStyle">
        <div class="virtuallist-list-item" :style="{ height: `${props.itemHeight}px` }" v-for="item in renderList" :key="item.id">
          <slot name="item" :item="item"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { onMounted, ref, reactive, computed, type CSSProperties, onUnmounted, watch } from 'vue';
import type { IVirtuallistProps } from './type';
import { throttle } from '@/utils/utils';

const props = withDefaults(defineProps<IVirtuallistProps<T & { id: number | string }>>(), {
  loadingText: '加载中',
  loadingBg: 'rgba(255, 255, 255, 0.8)',
});

const emit = defineEmits<{
  getData: [];
}>();

defineSlots<{
  item(props: { item: T & { id: number | string } }): any;
}>();

const contentRef = ref<HTMLDivElement>();

const state = reactive({
  startIndex: 0, // 当前视图列表在数据源中的起始索引
  viewHeight: 0, // container 高度
});

// 容器容纳最大item数量
const maxCount = computed(() => Math.ceil(state.viewHeight / props.itemHeight) + 1);

// endIndex 计算
const endIndex = computed(() => Math.min(state.startIndex + maxCount.value, props.dataSource.length - 1));

// 渲染item视图列表
const renderList = computed(() => props.dataSource.slice(state.startIndex, endIndex.value));

// 滚动样式设置
const scrollStyle = computed(
  () =>
    ({
      height: `${props.itemHeight * (props.dataSource.length - state.startIndex)}px`,
      transform: `translate3d(0, ${props.itemHeight * state.startIndex}px, 0)`,
    } as CSSProperties)
);

// 加载更多数据
watch(
  () => endIndex.value,
  newValue => {
    if (newValue >= props.dataSource.length - 1) {
      emit('getData');
    }
  }
);

// 滚动事件：动态计算 startIndex
const handleScroll = throttle(() => {
  const { scrollTop } = contentRef.value!;
  state.startIndex = Math.floor(scrollTop / props.itemHeight);
});

// resize事件：动态计算 viewHeight
const handleResize = throttle(() => {
  state.viewHeight = contentRef.value ? contentRef.value.offsetHeight : 0;
});

const init = () => {
  contentRef.value && contentRef.value.addEventListener('scroll', handleScroll);
  handleResize();
};

const destory = () => {
  contentRef.value && contentRef.value.removeEventListener('scroll', handleScroll);
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  destory();
});
</script>

<style scoped lang="scss">
.virtuallist {
  &-container {
    width: 100%;
    height: 100%;
  }
  &-content {
    width: 100%;
    height: 100%;
    overflow: auto;
    
  }
  &-list-item {
    width: 100%;
  }
}
</style>
