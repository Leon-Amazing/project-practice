<template>
  <div class="waterfall-virtual-container" v-loading="dataState.loading" element-loading-text="拼命加载中..." element-loading-background="rgba(255, 255, 255, 0.8)">
    <div class="waterfall-virtual-content" ref="contentRef">
      <div class="waterfall-virtual-list" :style="contentStyle">
        <div class="waterfall-virtual-item" v-for="{ item, style } in renderList" :key="item.id" :style="style">
          <slot name="item" :item="item"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw, reactive, onMounted, onUnmounted, type CSSProperties } from 'vue';
import type { IColumnQueue, IDataItem, IItemRect, IRenderItem, IVirtualWaterFallProps } from './type';
import { debounce, delay, throttle } from '@/utils/utils';

const props = withDefaults(defineProps<IVirtualWaterFallProps>(), {
  request: async () => ({ list: [], total: 0 }),
  gap: 20,
  column: 4,
  columnItemCount: 6,
  requestSize: 0,
});

const emit = defineEmits<{
  finishGetList: [];
}>();

defineSlots<{
  item(props: { item: IDataItem }): any;
}>();

const contentRef = ref<HTMLDivElement>();

const dataState = reactive({
  loading: false,
  isFinish: false,
  currentPage: 1,
  total: 0,
  list: [] as IDataItem[],
});

const columnState = reactive({
  queue: Array(props.column)
    .fill(0)
    .map<IColumnQueue>(() => ({ list: [], height: 0 })), // 存储所有卡片的二维数组
  len: 0, // 存储当前视图上展示的所有卡片数量
});

const scrollState = reactive({
  viewWidth: 0,
  viewHeight: 0,
  start: 0,
  get end() {
    return this.start + this.viewHeight;
  },
});

// 最大高度列，因为这个值代表着 DOM 结构中 list 的 height 样式，所以只要知道最高列的高度，就可以设置样式
const contentStyle = computed(() => ({ height: `${computedHeight.value.maxHeight}px` } as CSSProperties));

// 二维数组转一维
const columnList = computed(() => columnState.queue.reduce<IRenderItem[]>((pre, { list }) => pre.concat(list), []));

/*
 * 针对于一个 item，当其 y >= end 时表示它已超出 container 视图范围
 * 针对于一个 item，当其 y + h > start && y < end 时表示它在 container 视图中
 */
// 最终展示到视图上的 renderList
const renderList = computed(() => columnList.value.filter(i => i.h + i.y > scrollState.start && i.y < scrollState.end));

//当前的最小高度列以及其索引，最大高度列
const computedHeight = computed(() => {
  let minIndex = 0,
    maxIndex = 0,
    minHeight = Infinity,
    maxHeight = -Infinity;
  columnState.queue.forEach(({ height }, index) => {
    if (height < minHeight) {
      minHeight = height;
      minIndex = index;
    }
    if (height > maxHeight) {
      maxHeight = height;
      maxIndex = index;
    }
  });

  return {
    minIndex,
    maxIndex,
    minHeight,
    maxHeight,
  };
});

// 提前计算出每个卡片的宽度高度，之后可以通过 id 直接访问到该数据对应的卡片信息
const itemSizeInfo = computed(() =>
  dataState.list.reduce<Map<IDataItem['id'], IItemRect>>((pre, current) => {
    const itemWidth = Math.floor((scrollState.viewWidth - (props.column - 1) * props.gap) / props.column);
    pre.set(current.id, {
      width: itemWidth,
      height: Math.floor((itemWidth * current.height) / current.width),
    });
    return pre;
  }, new Map())
);

const requestSize = computed(() => props.requestSize || props.column * props.columnItemCount);

const hasMoreData = computed(() => columnState.len < dataState.list.length);

const loadDataList = async () => {
  if (dataState.isFinish) return;
  dataState.loading = true;
  await delay();
  const { list, total } = await props.request(dataState.currentPage++, requestSize.value);
  if (!list.length) {
    dataState.isFinish = true;
    emit('finishGetList');
    return;
  }
  dataState.list.push(...markRaw(list));
  dataState.total = total;
  dataState.loading = false;
};

// 将原数据源 item 转换为 cardItem 并添加到 dataState 队列里，添加的规则就是瀑布流布局操作
const addInQueue = (size = props.column) => {
  for (let i = 0; i < size; i++) {
    if (!hasMoreData.value) return;
    const minIndex = computedHeight.value.minIndex;
    const currentColumn = columnState.queue[minIndex];
    const before = currentColumn.list[currentColumn.list.length - 1] || null;
    const dataItem = dataState.list[columnState.len];
    const item = generatorItem(dataItem, before, minIndex);
    currentColumn.list.push(item);
    currentColumn.height += item.h;
    columnState.len++;
  }
};

const generatorItem = (item: IDataItem, before: IRenderItem | null, index: number): IRenderItem => {
  const rect = itemSizeInfo.value.get(item.id);
  const width = rect?.width || 0;
  const height = rect?.height || 0;
  let y = 0;
  if (before) y = before.y + before.h + props.gap;

  return markRaw({
    item,
    y,
    h: height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate3d(${index === 0 ? 0 : (width + props.gap) * index}px, ${y}px, 0)`,
    },
  });
};

// 全部重新计算 queueState 中的卡片数据
const reComputedQueue = () => {
  columnState.queue = columnState.queue.map((q, index) => {
    let height = 0;
    const list = q.list.reduce<IRenderItem[]>((total, { item }, i) => {
      const before = total[i - 1] || null;
      const result = generatorItem(item, before, index);
      height += result.h;
      total.push(result);
      return total;
    }, []);
    return {
      height,
      list,
    };
  });
};

const handleScroll = throttle(() => {
  const { scrollTop, clientHeight } = contentRef.value!;
  scrollState.start = scrollTop;
  if (!dataState.loading && !hasMoreData.value) {
    loadDataList().then(() => {
      addInQueue();
    });
    return;
  }

  if (scrollTop + clientHeight > computedHeight.value.minHeight) addInQueue();
});

const handleResize = debounce(() => {
  initScrollState();
  reComputedQueue();
}, 300);

const initScrollState = () => {
  scrollState.viewWidth = contentRef.value?.clientWidth || 0;
  scrollState.viewHeight = contentRef.value?.clientHeight || 0;
  scrollState.start = contentRef.value?.scrollTop || 0;
};

const init = async () => {
  initScrollState();
  await loadDataList();
  addInQueue(requestSize.value);
  contentRef.value?.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
};

const destory = () => {
  contentRef.value?.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleResize);
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  destory();
});
</script>

<style scoped lang="scss">
.waterfall-virtual {
  &-container {
    width: 100%;
    height: 100%;
  }

  &-content {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    
  }
  &-list {
    position: relative;
    width: 100%;
  }
  &-item {
    position: absolute;
    top: 0;
    left: 0;
    transition: all 0.3s;
    box-sizing: border-box;
  }
}
</style>
