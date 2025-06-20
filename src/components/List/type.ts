import type { CSSProperties } from 'vue';
// 虚拟列表
export interface IVirtuallistProps<T> {
  // 固定item高度
  itemHeight: number;
  // 展示loading
  loading: boolean;
  // loading 文本
  loadingText: string;
  // loading bg
  loadingBg: string;
  // 数据源
  dataSource: T[];
}

// 不定高虚拟列表
export interface IEstimatedListProps<T> {
  loading: boolean;
  loadingText: string;
  loadingBg: string;
  estimatedHeight: number;
  dataSource: T[];
}

export interface IPosInfo {
  // 当前pos对应的元素索引
  index: number;
  // 元素顶部所处位置
  top: number;
  // 元素底部所处位置
  bottom: number;
  // 元素高度
  height: number;
  // 高度差：判断是否需要更新
  dHeight: number;
}

// 瀑布流
export interface IWaterFallProps {
  gap: number; // 卡片间隔
  column: number; // 瀑布流列数
  pageSize: number; // 请求数量
  request: (page: number, pageSize: number) => Promise<IImageItem[]>;
}

export interface IImageItem {
  id: string | number;
  url: string;
  width: number;
  height: number;
  [key: string]: any;
}

// 瀑布流虚拟列表
export interface IVirtualWaterFallProps {
  column?: number;
  columnItemCount?: number;
  requestSize?: number;
  gap?: number;
  request?: VirtualWaterfallReuqest;
}

export interface IColumnQueue {
  list: Array<IRenderItem>;
  height: number;
}

export interface IItemRect {
  width: number;
  height: number;
}

// 渲染视图项
export interface IRenderItem {
  item: IDataItem;
  y: number;
  h: number;
  style: CSSProperties;
}

// 数据源项类型：固定宽高
export interface IDataItem {
  id: number | string;
  width: number;
  height: number;
  [key: string]: any;
}

// 数据请求
export type VirtualWaterfallReuqest = (
  page: number,
  pageSize: number
) => Promise<{
  total: number;
  list: IDataItem[];
}>;
