export type AnnotationType = 'rect' | 'polygon' | 'point';
export type DrawMode = 'rect' | 'polygon' | 'point' | 'select' | 'sam' | 'rotate' | 'ai' | 'copy' | '';

export interface Annotation {
  id: string;
  type: AnnotationType;
  label: any[];
  color: string;
  // rect
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // polygon / point
  points?: number[];
  // 是否被选中
  selected?: boolean;
  // 锁住：不能移动和修改
  locked?: boolean;
  // 隐藏
  hidden?: boolean;
  // 固定：不能移动，可以修改大小
  fixed?: boolean;
}

export interface ModelPrediction {
  type: AnnotationType;
  label: string;
  confidence: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: number[];
}
