<template>
  <div class="annotator-wrap">
    <div class="top-bar">
      <div class="top-bar__left">
        <el-upload :auto-upload="false" :show-file-list="false" accept="image/*" @change="(f: any) => loadImage(f.raw)">
          <el-button type="primary" :icon="'Upload'">上传图片</el-button>
        </el-upload>
      </div>
      <div class="top-bar__right">
        <el-button @click="handleExport" :disabled="!annotations.length">导出 COCO</el-button>
        <el-button @click="handleExportYOLO" :disabled="!annotations.length">导出 YOLO</el-button>
      </div>
    </div>
    <div class="content">
      <div class="toolbar">
        <el-tooltip v-for="tool in tools" :key="tool.value" :content="tool.label" placement="right">
          <div class="tool-wrap" :class="{ active: mode === tool.value, disabled: isReadonly }" @click="!isReadonly && handleToolClick(tool.value)">
            <img :src="mode === tool.value ? tool.activeIcon : tool.icon" class="tool-icon" />
          </div>
        </el-tooltip>
      </div>

      <div class="main">
        <!-- Canvas 标注区 -->
        <div ref="stageWrapRef" class="stage-wrap" :style="{ cursor: stageCursor }" @mouseleave="handleMouseLeave">
          <!-- RDP 抽稀容差控制 -->
          <div class="rdp-control" v-if="mode === 'sam'">
            <div class="rdp-slider-wrap">
              <div class="rdp-label">点位:</div>
              <el-slider v-model="rdpEpsilon" :min="8" :max="10" :step="0.5" :disabled="isReadonly" style="width: 150px; height: 15px" :show-tooltip="false" />
            </div>
            <div class="rdp-hint">
              <span class="rdp-less">少</span>
              <span class="rdp-more">多</span>
            </div>
          </div>
          <v-stage :config="stageConfig" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @dblclick="!isReadonly && onStageDblClick" @wheel="handleWheel">
            <!-- 图片层 -->
            <v-layer>
              <v-image :config="rotatedImgConfig" />
            </v-layer>

            <!-- 标注层 -->
            <v-layer>
              <!-- 矩形标注 -->
              <template v-for="ann in annotations.filter(a => a.type === 'rect' && !a.hidden)" :key="ann.id">
                <v-rect
                  :config="{
                    x: ann.x,
                    y: ann.y,
                    width: ann.width,
                    height: ann.height,
                    stroke: ann.color,
                    strokeWidth: 2,
                    strokeScaleEnabled: false,
                    fill: isActive(ann.id) && !ann.locked && mode !== 'sam' ? hexToRgba(ann.color, 0.25) : 'transparent',
                    annId: ann.id,
                  }"
                  @click="selectAnnotation(ann.id)" />
                <!-- 矩形 8 个控制点：角点(方形) + 边中点(圆形) -->
                <template v-if="isActive(ann.id) && !ann.locked && mode !== 'sam'">
                  <template v-for="(h, hi) in getRectHandles(ann)" :key="h.type">
                    <template v-if="['nw', 'ne', 'se', 'sw'].includes(h.type)">
                      <v-rect
                        v-if="hoveredVertex?.annId === ann.id && hoveredVertex?.index === hi"
                        :config="{
                          x: h.x - 9 / stageScale,
                          y: h.y - 9 / stageScale,
                          width: 18 / stageScale,
                          height: 18 / stageScale,
                          fill: 'transparent',
                          stroke: ann.color,
                          strokeWidth: 1.5,
                          strokeScaleEnabled: false,
                          opacity: 0.5,
                          cornerRadius: 2,
                        }" />
                      <v-rect
                        :config="{
                          x: h.x - 5 / stageScale,
                          y: h.y - 5 / stageScale,
                          width: 10 / stageScale,
                          height: 10 / stageScale,
                          fill: hoveredVertex?.annId === ann.id && hoveredVertex?.index === hi ? ann.color : '#fff',
                          stroke: ann.color,
                          strokeWidth: 2,
                          strokeScaleEnabled: false,
                          annId: ann.id,
                        }" />
                    </template>
                    <template v-else>
                      <v-circle
                        v-if="hoveredVertex?.annId === ann.id && hoveredVertex?.index === hi"
                        :config="{
                          x: h.x,
                          y: h.y,
                          radius: 9 / stageScale,
                          fill: 'transparent',
                          stroke: ann.color,
                          strokeWidth: 1.5,
                          strokeScaleEnabled: false,
                          opacity: 0.5,
                        }" />
                      <v-circle
                        :config="{
                          x: h.x,
                          y: h.y,
                          radius: (hoveredVertex?.annId === ann.id && hoveredVertex?.index === hi ? 6 : 5) / stageScale,
                          fill: hoveredVertex?.annId === ann.id && hoveredVertex?.index === hi ? ann.color : '#fff',
                          stroke: ann.color,
                          strokeWidth: 2,
                          strokeScaleEnabled: false,
                          annId: ann.id,
                        }" />
                    </template>
                  </template>
                </template>
              </template>

              <!-- 多边形标注 -->
              <template v-for="ann in annotations.filter(a => a.type === 'polygon' && !a.hidden)" :key="ann.id">
                <v-line
                  :config="{
                    points: ann.points,
                    closed: true,
                    stroke: ann.color,
                    strokeWidth: 2,
                    strokeScaleEnabled: false,
                    fill: isActive(ann.id) && !ann.locked && mode !== 'sam' ? hexToRgba(ann.color, 0.25) : 'transparent',
                    annId: ann.id,
                  }"
                  @click="selectAnnotation(ann.id)" />
                <template v-if="isActive(ann.id) && !ann.locked && mode !== 'sam'">
                  <template v-for="(v, vi) in getVertices(ann)" :key="vi">
                    <v-circle
                      v-if="hoveredVertex?.annId === ann.id && hoveredVertex?.index === vi"
                      :config="{
                        x: v.x,
                        y: v.y,
                        radius: 10 / stageScale,
                        fill: 'transparent',
                        stroke: ann.color,
                        strokeWidth: 1.5,
                        strokeScaleEnabled: false,
                        opacity: 0.5,
                      }" />
                    <v-circle
                      :config="{
                        x: v.x,
                        y: v.y,
                        radius: (hoveredVertex?.annId === ann.id && hoveredVertex?.index === vi ? 7 : 5) / stageScale,
                        fill: hoveredVertex?.annId === ann.id && hoveredVertex?.index === vi ? ann.color : '#fff',
                        stroke: ann.color,
                        strokeWidth: 2,
                        strokeScaleEnabled: false,
                        annId: ann.id,
                      }" />
                  </template>
                </template>
              </template>

              <!-- 点标注 -->
              <template v-for="ann in annotations.filter(a => a.type === 'point' && !a.hidden)" :key="ann.id">
                <v-circle
                  :config="{
                    x: ann.points![0],
                    y: ann.points![1],
                    radius: (ann.id === selectedId ? 8 : 6) / stageScale,
                    fill: ann.color,
                    stroke: isActive(ann.id) && !ann.locked && mode !== 'sam' ? 'white' : ann.color,
                    strokeWidth: 2,
                    strokeScaleEnabled: false,
                    annId: ann.id,
                  }"
                  @click="selectAnnotation(ann.id)" />
              </template>

              <!-- 绘制中：矩形预览 -->
              <v-rect
                v-if="tempRect"
                :config="{
                  x: tempRect.x,
                  y: tempRect.y,
                  width: tempRect.width,
                  height: tempRect.height,
                  stroke: tempRect.color,
                  strokeWidth: 2,
                  strokeScaleEnabled: false,
                  dash: [6 / stageScale, 3 / stageScale],
                  fill: hexToRgba(tempRect.color),
                }" />

              <!-- 绘制中：多边形预览（>=3点时闭合显示） -->
              <v-line
                v-if="previewPolygonPoints.length >= 4"
                :config="{
                  points: previewPolygonPoints,
                  closed: polygonCanFinish,
                  stroke: '#fff',
                  strokeWidth: 1.5,
                  strokeScaleEnabled: false,
                  dash: [6 / stageScale, 3 / stageScale],
                  fill: polygonCanFinish ? 'rgba(255,255,255,0.08)' : 'transparent',
                }" />
              <!-- 已确认顶点 -->
              <v-circle
                v-for="(_, i) in tempPoints.filter((__, j) => j % 2 === 0).slice(1)"
                :key="i + 1"
                :config="{
                  x: tempPoints[(i + 1) * 2],
                  y: tempPoints[(i + 1) * 2 + 1],
                  radius: 4 / stageScale,
                  fill: '#fff',
                  stroke: '#333',
                  strokeWidth: 1,
                  strokeScaleEnabled: false,
                }" />
              <!-- 复制幽灵预览：矩形 -->
              <v-rect
                v-if="copyGhost && copyGhost.type === 'rect'"
                :config="{
                  x: copyGhost.x,
                  y: copyGhost.y,
                  width: copyGhost.width,
                  height: copyGhost.height,
                  stroke: copyGhost.color,
                  strokeWidth: 2,
                  strokeScaleEnabled: false,
                  dash: [6 / stageScale, 3 / stageScale],
                  fill: hexToRgba(copyGhost.color, 0.15),
                  opacity: 0.7,
                }" />
              <!-- 复制幽灵预览：多边形/点 -->
              <v-line
                v-if="copyGhost && copyGhost.type === 'polygon'"
                :config="{
                  points: copyGhost.points,
                  closed: true,
                  stroke: copyGhost.color,
                  strokeWidth: 2,
                  strokeScaleEnabled: false,
                  dash: [6 / stageScale, 3 / stageScale],
                  fill: hexToRgba(copyGhost.color, 0.15),
                  opacity: 0.7,
                }" />
              <v-circle
                v-if="copyGhost && copyGhost.type === 'point'"
                :config="{
                  x: copyGhost.points![0],
                  y: copyGhost.points![1],
                  radius: 6 / stageScale,
                  fill: copyGhost.color,
                  opacity: 0.7,
                  strokeScaleEnabled: false,
                }" />

              <!-- 首点 -->
              <v-circle
                v-if="tempPoints.length >= 2"
                :config="{
                  x: tempPoints[0],
                  y: tempPoints[1],
                  radius: (nearFirstPoint ? 8 : 5) / stageScale,
                  fill: nearFirstPoint ? '#44FF88' : '#fff',
                  stroke: nearFirstPoint ? '#00cc44' : '#333',
                  strokeWidth: 2,
                  strokeScaleEnabled: false,
                }" />

              <!-- 智能剪刀预览线条 -->
              <v-line
                v-if="scissorsPreviewPoints.length >= 4"
                :config="{
                  points: scissorsPreviewPoints,
                  closed: scissorsHasEnoughPoints,
                  stroke: '#00ff88',
                  strokeWidth: 2,
                  strokeScaleEnabled: false,
                  fill: scissorsHasEnoughPoints ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                }" />
              <!-- 智能剪刀已确认点标记 -->
              <v-circle
                v-for="(p, i) in scissorsConfirmedPoints"
                :key="'scissors-point-' + i"
                :config="{
                  x: p.x,
                  y: p.y,
                  radius: (i === 0 ? 6 : 4) / stageScale,
                  fill: i === 0 ? '#44FF88' : '#fff',
                  stroke: '#00cc44',
                  strokeWidth: 1.5,
                  strokeScaleEnabled: false,
                }" />
            </v-layer>
          </v-stage>

          <!-- 多边形确认按钮 -->
          <div v-if="!isReadonly && mode === 'polygon' && polygonCanFinish" class="polygon-confirm">
            <el-button type="success" size="small" @click="finishPolygon">✓ 完成多边形</el-button>
            <el-button size="small" @click="cancelPolygon">✕ 取消</el-button>
          </div>
        </div>
      </div>

      <!-- 右侧标注列表 -->
      <div class="ann-list">
        <div class="ann-list__header">
          <span class="title">标注对象列表</span>
        </div>
        <div class="ann-list__scroll">
          <div
            v-for="(ann, index) in annotations"
            :key="ann.id"
            class="ann-item"
            :class="{ 'is-selected': ann.id === selectedId }"
            @click="!isReadonly && selectAnnotation(ann.id)"
            @mouseenter="hoveredId = ann.id"
            @mouseleave="hoveredId = null">
            <div class="ann-header">
              <span class="ann-color" :style="{ background: ann.color }" />
              <div class="ann-label">
                <div class="label-text">对象{{ index + 1 }}</div>
                <el-dropdown>
                  <span class="el-dropdown-link">
                    <el-icon><MoreFilled /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        :disabled="isReadonly"
                        @click="
                          () => {
                            if (!isReadonly) {
                              startCopy(ann.id);
                            }
                          }
                        "
                        >复制</el-dropdown-item
                      >
                      <el-dropdown-item
                        :disabled="isReadonly"
                        @click="
                          () => {
                            if (!isReadonly) {
                              selectedId = ann.id;
                              deleteSelected();
                            }
                          }
                        "
                        >删除</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <el-icon class="more-btn" @click.stop><MoreVertical /></el-icon>
            </div>
            <div class="ann-shape">形状：{{ ann.type === 'rect' ? '矩形' : ann.type === 'polygon' ? '多边形' : '点' }}</div>
            <div class="ann-tags">
              <el-cascader
                v-model="ann.label"
                :options="optionList"
                :props="{
                  value: 'id',
                  label: 'name',
                  children: 'attributeList',
                  multiple: true,
                }"
                placeholder="请选择标注类别"
                :disabled="isReadonly" />
            </div>
            <div class="ann-actions">
              <div
                class="ann-actions-item"
                :class="{ active: ann.locked }"
                @click.stop="
                  () => {
                    if (!isReadonly) {
                      toggleLock(ann.id);
                    }
                  }
                ">
                <img :src="ann.locked ? getImgUrl('/images/lock.png') : getImgUrl('/images/unlock.png')" />
              </div>
              <div class="ann-actions-item" :class="{ active: ann.hidden }" @click.stop="toggleVisibility(ann.id)">
                <img :src="ann.hidden ? getImgUrl('/images/eye_close.png') : getImgUrl('/images/eye_open.png')" />
              </div>
              <div
                class="ann-actions-item"
                :class="{ active: ann.fixed }"
                @click.stop="
                  () => {
                    if (!isReadonly) {
                      toggleFixed(ann.id);
                    }
                  }
                ">
                <img :src="ann.fixed ? getImgUrl('/images/fixed2.png') : getImgUrl('/images/fixed1.png')" />
              </div>
            </div>
          </div>
          <el-empty v-if="!annotations.length" description="暂无标注" :image-size="60" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getImgUrl } from '@/utils/utils';
import { useAnnotation } from './useAnnotation';
import type { DrawMode } from './types';

const {
  annotations,
  mode,
  imageRotation,
  currentLabel,
  labels,
  selectedId,
  hoveredId,
  tempRect,
  tempPoints,
  previewPolygonPoints,
  polygonCanFinish,
  nearFirstPoint,
  draggingVertex,
  hoveredVertexCursor,
  hoveredVertex,
  getRectHandles,
  getVertices,
  getVertexCursorAt,
  onStageMouseDown,
  onStageMouseMove,
  onStageMouseUp,
  onStageDblClick,
  selectAnnotation,
  deleteSelected,
  updateAnnotation,
  cancelPolygon,
  finishPolygon,
  exportCOCO,
  exportYOLO,
  undo,
  redo,
  canUndo,
  canRedo,
  toggleLock,
  toggleVisibility,
  toggleFixed,
  copySource,
  copyGhost,
  startCopy,
  updateCopyGhost,
  placeCopy,
  cancelCopy,
  stageScale,
} = useAnnotation();

import { useCanvasFit } from './useCanvasFit';
import { useImageLoader } from './useImageLoader';
import { useScissors } from './useScissors';
import { useStageInteraction } from './useStageInteraction';
import { useExport } from './useExport';
import { useTools } from './useTools';

const props = withDefaults(
  defineProps<{
    url: string;
  }>(),
  {
    url: '',
  },
);
const emit = defineEmits<{ save: [data: object] }>();

// 工具函数
const { tools, hexToRgba, rotatePoint } = useTools();
// 是否激活（hover 或 selected）
const isActive = (id: string) => id === selectedId.value || id === hoveredId.value;
const isReadonly = ref(false);

// 图片配置
const imgConfig = ref<any>({ image: null, x: 0, y: 0, width: 0, height: 0 });
// 画布位置
const stagePos = ref({ x: 0, y: 0 });
// 任务详情
const detail = ref<any>({});
// 标注要素类别选项列表
const optionList: any = ref([
  {
    id: 'object',
    name: '物体',
    attributeList: [],
  },
  {
    id: 'person',
    name: '人',
    attributeList: [],
  },
  {
    id: 'vehicle',
    name: '车辆',
    attributeList: [],
  },
]);

/* 工具点击事件 */
function handleToolClick(toolValue: DrawMode) {
  if (toolValue === 'rotate') {
    const cx = imgConfig.value.x + imgConfig.value.width / 2;
    const cy = imgConfig.value.y + imgConfig.value.height / 2;
    const rad = Math.PI / 2; // 90度
    const cos = Math.cos(rad),
      sin = Math.sin(rad);

    // 对所有标注坐标绕图片中心旋转 90度
    annotations.value = annotations.value.map(ann => {
      if (ann.type === 'rect') {
        // 矩形转为多边形（旋转后不再是轴对齐矩形），取新包围盒
        const { x = 0, y = 0, width = 0, height = 0 } = ann;
        const corners = [
          { x, y },
          { x: x + width, y },
          { x: x + width, y: y + height },
          { x, y: y + height },
        ].map(p => rotatePoint(p, cx, cy, cos, sin));
        const xs = corners.map(p => p.x),
          ys = corners.map(p => p.y);
        const nx = Math.min(...xs),
          ny = Math.min(...ys);
        return { ...ann, x: nx, y: ny, width: Math.max(...xs) - nx, height: Math.max(...ys) - ny };
      } else {
        const pts = ann.points ?? [];
        const newPts: number[] = [];
        for (let i = 0; i < pts.length; i += 2) {
          const p = rotatePoint({ x: pts[i], y: pts[i + 1] }, cx, cy, cos, sin);
          newPts.push(p.x, p.y);
        }
        return { ...ann, points: newPts };
      }
    });

    imageRotation.value = (imageRotation.value + 90) % 360;
  } else {
    mode.value = toolValue;
    // 切换工具时，如果绘制的不是多边形，清空临时点
    if (mode.value !== 'polygon' && tempPoints.value.length > 0) {
      cancelPolygon();
    }
    if (mode.value !== 'sam' && scissorsConfirmedPoints.value.length > 0) {
      cancelScissors();
    }
  }
}

// 图片旋转后的 imgConfig
const rotatedImgConfig = computed(() => ({
  ...imgConfig.value,
  rotation: imageRotation.value,
  offsetX: imgConfig.value.width / 2,
  offsetY: imgConfig.value.height / 2,
  x: imgConfig.value.x + imgConfig.value.width / 2,
  y: imgConfig.value.y + imgConfig.value.height / 2,
}));

// 当前画布 cursor——优先级：平移 > 旋转 > 端点resize > 图形move > 默认
const stageCursor = computed(() => {
  if (spaceDown.value || panStart.value) return 'grab';
  if (mode.value === 'rotate') return 'grab';
  if (mode.value === 'sam') return 'crosshair';
  if (hoveredVertexCursor.value) return hoveredVertexCursor.value;
  if (hoveredId.value) return 'move';
  if (mode.value !== 'select') return 'crosshair';
  return 'default';
});

/* 使用画布适配 */
const { stageWrapRef, stageWidth, stageHeight, scaleRatio, fitStageToContainer, annToNative, annFromNative } = useCanvasFit(imgConfig, annotations, stageScale, stagePos, () => initScissors());

/* 图片加载逻辑 */
const { imageBase64, loadImage, loadImageFromUrl } = useImageLoader(
  imgConfig,
  () => fitStageToContainer(),
  () => initScissors(),
);

/* 鼠标和键盘事件 */
const { spaceDown, panStart, stageConfig, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } = useStageInteraction(
  stageWidth,
  stageHeight,
  stageScale,
  stagePos,
  isReadonly,
  mode,
  tempPoints,
  draggingVertex,
  hoveredVertex,
  hoveredVertexCursor,
  hoveredId,
  selectedId,
  placeCopy,
  cancelCopy,
  onStageMouseDown,
  onStageMouseMove,
  onStageMouseUp,
  updateCopyGhost,
  getVertexCursorAt,
  finishPolygon,
  cancelPolygon,
  deleteSelected,
  undo,
  redo,
  (a, b) => handleScissorsClick(a, b),
  (a, b) => handleScissorsMove(a, b),
  params => finishScissors(params),
  () => cancelScissors(),
);

/* 导出事件 */
const { handleExport, handleExportYOLO } = useExport(imgConfig, scaleRatio, emit, exportCOCO, exportYOLO);

/* OpenCV 智能剪刀 */
const { scissorsConfirmedPoints, scissorsPreviewPoints, scissorsHasEnoughPoints, rdpEpsilon, initScissors, handleScissorsClick, handleScissorsMove, finishScissors, cancelScissors } = useScissors(
  () => imgConfig.value,
  () => {
    finishPolygon();
    mode.value = 'select';
  },
  () => cancelPolygon(),
);

onMounted(async () => {
  loadImageFromUrl(props.url);
});
</script>

<style scoped lang="scss">
.annotator-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #fff;

  &__right {
    display: flex;
    gap: 8px;
  }
}

.content {
  height: 100%;
  display: flex;
  gap: 12px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 5px 12px;
  background: #f0f4f8;
}
.tool-wrap {
  background-color: #f8fbff;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    .tool-icon {
      transform: scale(1.1);
    }
  }
  &.active {
    background-color: #2f84e7;
  }
  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }
  .tool-icon {
    width: 15px;
    height: 15px;
    object-fit: cover;
    transition: all 0.2s;
  }
}

.rdp-control {
  position: absolute;
  left: 50%;
  top: 5px;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 5px 20px;
  background: #ffffff;
  border-radius: 6px;

  .rdp-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
  }

  .rdp-slider-wrap {
    display: flex;
    align-items: center;
    width: 200px;

    .rdp-label {
      margin-right: 12px;
    }

    :deep(.el-slider__track) {
      background: linear-gradient(to right, #6b9eff, #4ade80);
      height: 6px;
      border-radius: 3px;
    }

    :deep(.el-slider__fill) {
      background: transparent;
    }

    :deep(.el-slider__thumb) {
      width: 16px;
      height: 16px;
      background: #ffffff;
      border: 2px solid #4ade80;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      margin-top: -5px;
    }

    :deep(.el-slider__runway) {
      height: 5px;
      background: #e5e7eb;
      border-radius: 3px;
    }
  }

  .rdp-hint {
    display: flex;
    justify-content: space-between;
    width: 200px;
    font-size: 10px;

    .rdp-less {
      color: #6b9eff;
    }

    .rdp-more {
      color: #4ade80;
      font-weight: 500;
    }
  }
}

.main {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.stage-wrap {
  position: relative;
  background: #f5f5f5;
  overflow: hidden;
  flex: 1;
  min-width: 0;
  width: 100%;

  .placeholder,
  .loading-mask {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #aaa;
  }

  .loading-mask {
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    z-index: 10;
  }

  .polygon-confirm {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 20;
  }

  .overlay-canvas {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 5;
    transform-origin: 0 0;
  }
}

.ann-list {
  width: 280px;
  background: #fff;
  padding: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  position: relative;

  &__header {
    font-size: 14px;
    font-weight: 600;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #f0f0f0;

    .title {
      flex: 1;
      color: #333;
      font-size: 16px;
    }

    .quality-btn {
      color: #345fb1;
      padding: 4px 12px;
      font-size: 12px;
      border-radius: 4px;
      &.danger {
        color: #f56c6c;
        background: #fff4f3;
        border-color: #f56c6c;
      }
    }
  }

  .ann-list__scroll {
    flex: 1;
    overflow: auto;
  }
}

.ann-item {
  margin: 10px;
  padding: 12px 16px;
  border: 1px solid #f3f8ff;
  background-color: #fbfdff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    background: #f3f8ff;
  }
  &.is-selected {
    background: #f3f8ff;
  }

  .ann-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .ann-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .ann-label {
      width: 100%;
      flex: 1;
      display: flex;
      justify-content: space-between;
      font-weight: 500;
      color: #333;
    }

    .more-btn {
      color: #999;
      cursor: pointer;
      font-size: 16px;
    }
  }

  .ann-shape {
    color: #666;
    font-size: 12px;
    margin-bottom: 10px;
  }

  .ann-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;

    .el-tag {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;

      &.is-default {
        background: #f5f5f5;
        color: #666;
        border: 1px solid #d9d9d9;
      }

      &.is-highlight {
        background: #fff7e6;
        color: #d46b08;
        border: 1px solid #ffd591;
      }
    }
  }

  .ann-actions {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    .ann-actions-item {
      border: 1px solid #e8e8e8;
      padding: 2px 20px;
      cursor: pointer;
      &.active {
        border-color: #2f84e7;
        background: #e8f3ff;
      }
    }
    img {
      width: 15px;
      height: 15px;
      object-fit: cover;
    }
  }
}
</style>
