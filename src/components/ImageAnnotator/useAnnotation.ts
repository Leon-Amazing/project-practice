import { ref, computed } from 'vue';
import axios from 'axios';
import type { Annotation, DrawMode, ModelPrediction } from './types';

const LABEL_COLORS = ['#E11D48', '#2563EB', '#16A34A', '#F59E0B', '#9333EA'];
const CLOSE_THRESHOLD = 10;
const VERTEX_HIT_RADIUS = 8; // 基础检测半径（画布坐标）

// 矩形控制点类型：角点 or 边中点，以及对应的 resize cursor
export type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
const HANDLE_CURSORS: Record<HandleType, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

export function useAnnotation() {
  const stageScale = ref(1); // 图片缩放比例
  const annotations = ref<Annotation[]>([]);
  const mode = ref<DrawMode>('');
  const currentLabel = ref('');
  const labels = ref(['object', 'person', 'car', 'animal']);
  const selectedId = ref<string | null>(null);
  const hoveredId = ref<string | null>(null);
  const loading = ref(false);
  // 标记是否有用户修改
  const hasUserChange = ref(false);
  // ── Undo / Redo ───────────────────────────────────────
  const history = ref<Annotation[][]>([]);
  const future = ref<Annotation[][]>([]);

  function snapshot() {
    history.value.push(JSON.parse(JSON.stringify(annotations.value)));
    future.value = [];
    hasUserChange.value = true;
  }

  function undo() {
    if (!history.value.length) return;
    future.value.push(JSON.parse(JSON.stringify(annotations.value)));
    annotations.value = history.value.pop()!;
  }

  function redo() {
    if (!future.value.length) return;
    history.value.push(JSON.parse(JSON.stringify(annotations.value)));
    annotations.value = future.value.pop()!;
  }

  const canUndo = computed(() => history.value.length > 0);
  const canRedo = computed(() => future.value.length > 0);

  // ── 绘制状态 ──────────────────────────────────────────
  const drawing = ref(false);
  const tempPoints = ref<number[]>([]);
  const tempRect = ref<Annotation | null>(null);
  const mousePos = ref({ x: 0, y: 0 });

  // 图片旋转角度（度）
  const imageRotation = ref(0);
  // 旋转拖拽起始角度
  let rotateStartAngle = 0;
  let rotateStartPos: { x: number; y: number } | null = null;
  let rotateCenterX = 0;
  let rotateCenterY = 0;

  // 端点拖拽状态（矩形用 handleType，多边形用 vertexIndex）
  const draggingVertex = ref<{ annId: string; vertexIndex: number; handleType?: HandleType } | null>(null);
  // 当前鼠标悬停的控制点 cursor
  const hoveredVertexCursor = ref<string | null>(null);
  // 当前悬停的端点标识
  const hoveredVertex = ref<{ annId: string; index: number } | null>(null);
  // 整体拖拽状态
  const draggingShape = ref<{ annId: string; startPos: { x: number; y: number }; origAnn: Annotation } | null>(null);

  let startPos = { x: 0, y: 0 };

  function genId() {
    return `ann_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  function getLabelColor() {
    const index = annotations.value.length;
    return LABEL_COLORS[index % LABEL_COLORS.length];
  }

  // 矩形 8 个控制点
  function getRectHandles(ann: Annotation): { x: number; y: number; type: HandleType }[] {
    const { x = 0, y = 0, width = 0, height = 0 } = ann;
    const cx = x + width / 2,
      cy = y + height / 2;
    return [
      { x, y, type: 'nw' },
      { x: cx, y, type: 'n' },
      { x: x + width, y, type: 'ne' },
      { x: x + width, y: cy, type: 'e' },
      { x: x + width, y: y + height, type: 'se' },
      { x: cx, y: y + height, type: 's' },
      { x, y: y + height, type: 'sw' },
      { x, y: cy, type: 'w' },
    ];
  }

  // 多边形/点 端点
  function getVertices(ann: Annotation): { x: number; y: number }[] {
    if (ann.type === 'polygon' || ann.type === 'point') {
      const pts = ann.points ?? [];
      const result: { x: number; y: number }[] = [];
      for (let i = 0; i < pts.length; i += 2) result.push({ x: pts[i], y: pts[i + 1] });
      return result;
    }
    return [];
  }

  // 根据矩形 handleType 更新坐标（支持缩小）
  function applyRectHandle(ann: Annotation, handleType: HandleType, nx: number, ny: number): Partial<Annotation> {
    let { x = 0, y = 0, width = 0, height = 0 } = ann;
    const r = x + width,
      b = y + height;
    switch (handleType) {
      case 'nw':
        x = nx;
        y = ny;
        width = r - nx;
        height = b - ny;
        break;
      case 'n':
        y = ny;
        height = b - ny;
        break;
      case 'ne':
        y = ny;
        width = nx - x;
        height = b - ny;
        break;
      case 'e':
        width = nx - x;
        break;
      case 'se':
        width = nx - x;
        height = ny - y;
        break;
      case 's':
        height = ny - y;
        break;
      case 'sw':
        x = nx;
        width = r - nx;
        height = ny - y;
        break;
      case 'w':
        x = nx;
        width = r - nx;
        break;
    }
    // 归一化（允许翻转后仍有效）
    if (width < 0) {
      x += width;
      width = -width;
    }
    if (height < 0) {
      y += height;
      height = -height;
    }
    return { x, y, width, height };
  }

  // 多边形端点移动
  function applyVertexMove(ann: Annotation, vertexIndex: number, nx: number, ny: number): Partial<Annotation> {
    if (ann.type === 'polygon' || ann.type === 'point') {
      const pts = [...(ann.points ?? [])];
      pts[vertexIndex * 2] = nx;
      pts[vertexIndex * 2 + 1] = ny;
      return { points: pts };
    }
    return {};
  }

  // ── 手动标注 ──────────────────────────────────────────

  function startRotate(pos: { x: number; y: number }, imgCx: number, imgCy: number) {
    rotateCenterX = imgCx;
    rotateCenterY = imgCy;
    rotateStartPos = pos;
    rotateStartAngle = imageRotation.value;
  }

  function updateRotate(pos: { x: number; y: number }) {
    if (!rotateStartPos) return;
    const startAngle = Math.atan2(rotateStartPos.y - rotateCenterY, rotateStartPos.x - rotateCenterX);
    const curAngle = Math.atan2(pos.y - rotateCenterY, pos.x - rotateCenterX);
    const delta = ((curAngle - startAngle) * 180) / Math.PI;
    imageRotation.value = rotateStartAngle + delta;
  }

  function endRotate() {
    rotateStartPos = null;
  }

  function onStageMouseDown(pos: { x: number; y: number }) {
    // 非绘制进行中时，优先处理图形交互（控制点 + 整体拖拽）
    const isDrawing = (mode.value === 'rect' && drawing.value) || (mode.value === 'polygon' && tempPoints.value.length > 0);
    // 根据缩放调整检测半径，保持视觉上的检测范围一致
    const hitRadius = VERTEX_HIT_RADIUS / stageScale.value;

    if (!isDrawing && mode.value !== 'point' && mode.value !== 'sam') {
      // 优先检测控制点拖拽（仅激活图形）
      const activeId = hoveredId.value ?? selectedId.value;
      if (activeId) {
        const ann = annotations.value.find(a => a.id === activeId);
        if (ann && !ann.locked) {
          if (ann.type === 'rect') {
            const handles = getRectHandles(ann);
            for (let i = 0; i < handles.length; i++) {
              if (Math.hypot(pos.x - handles[i].x, pos.y - handles[i].y) <= hitRadius) {
                snapshot();
                draggingVertex.value = { annId: ann.id, vertexIndex: i, handleType: handles[i].type };
                return;
              }
            }
          } else {
            const verts = getVertices(ann);
            for (let i = 0; i < verts.length; i++) {
              if (Math.hypot(pos.x - verts[i].x, pos.y - verts[i].y) <= hitRadius) {
                snapshot();
                draggingVertex.value = { annId: ann.id, vertexIndex: i };
                return;
              }
            }
          }
        }
      }
      // hover 到图形上则整体拖拽（不限 select 模式）
      if (hoveredId.value) {
        const hit = annotations.value.find(a => a.id === hoveredId.value)!;
        selectedId.value = hit.id;
        // locked 或 fixed 时不允许整体拖拽
        if (hit.locked || hit.fixed) return;
        snapshot();
        draggingShape.value = {
          annId: hit.id,
          startPos: { ...pos },
          origAnn: JSON.parse(JSON.stringify(hit)),
        };
        return;
      }
      if (mode.value === 'select') {
        selectedId.value = null;
        return;
      }
    }

    if (mode.value === 'select') return;

    if (mode.value === 'rect') {
      drawing.value = true;
      startPos = pos;
      tempRect.value = {
        id: genId(),
        type: 'rect',
        label: [],
        color: getLabelColor(),
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      };
    }

    if (mode.value === 'point') {
      snapshot();
      annotations.value.push({
        id: genId(),
        type: 'point',
        label: [],
        color: getLabelColor(),
        points: [pos.x, pos.y],
      });
    }

    if (mode.value === 'polygon') {
      if (tempPoints.value.length >= 6) {
        const [fx, fy] = tempPoints.value;
        if (Math.hypot(pos.x - fx, pos.y - fy) <= CLOSE_THRESHOLD) {
          finishPolygon();
          return;
        }
      }
      tempPoints.value.push(pos.x, pos.y);
    }
  }

  // 简单点击命中检测
  function findAnnotationAt(pos: { x: number; y: number }): Annotation | null {
    for (let i = annotations.value.length - 1; i >= 0; i--) {
      const ann = annotations.value[i];
      if (ann.type === 'rect') {
        const { x = 0, y = 0, width = 0, height = 0 } = ann;
        if (pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height) return ann;
      } else if (ann.type === 'point') {
        const [px, py] = ann.points ?? [];
        if (Math.hypot(pos.x - px, pos.y - py) <= 10) return ann;
      } else if (ann.type === 'polygon') {
        if (pointInPolygon(pos, ann.points ?? [])) return ann;
      }
    }
    return null;
  }

  function pointInPolygon(pos: { x: number; y: number }, pts: number[]) {
    let inside = false;
    const n = pts.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = pts[i * 2],
        yi = pts[i * 2 + 1];
      const xj = pts[j * 2],
        yj = pts[j * 2 + 1];
      if (yi > pos.y !== yj > pos.y && pos.x < ((xj - xi) * (pos.y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  function onStageMouseMove(pos: { x: number; y: number }) {
    mousePos.value = pos;

    if (draggingVertex.value) {
      const { annId, vertexIndex, handleType } = draggingVertex.value;
      const idx = annotations.value.findIndex(a => a.id === annId);
      if (idx !== -1) {
        const ann = annotations.value[idx];
        const patch = handleType ? applyRectHandle(ann, handleType, pos.x, pos.y) : applyVertexMove(ann, vertexIndex, pos.x, pos.y);
        annotations.value[idx] = { ...ann, ...patch };
      }
      return;
    }

    if (draggingShape.value) {
      const { annId, startPos: sp, origAnn } = draggingShape.value;
      const dx = pos.x - sp.x;
      const dy = pos.y - sp.y;
      const idx = annotations.value.findIndex(a => a.id === annId);
      if (idx !== -1) {
        if (origAnn.type === 'rect') {
          annotations.value[idx] = { ...annotations.value[idx], x: (origAnn.x ?? 0) + dx, y: (origAnn.y ?? 0) + dy };
        } else {
          const pts = (origAnn.points ?? []).map((v, i) => (i % 2 === 0 ? v + dx : v + dy));
          annotations.value[idx] = { ...annotations.value[idx], points: pts };
        }
      }
      return;
    }

    if (mode.value === 'rect' && drawing.value && tempRect.value) {
      tempRect.value.width = pos.x - startPos.x;
      tempRect.value.height = pos.y - startPos.y;
    }
  }

  function onStageMouseUp() {
    draggingVertex.value = null;
    draggingShape.value = null;

    if (mode.value === 'rect' && drawing.value && tempRect.value) {
      const r = tempRect.value;
      if (r.width! < 0) {
        r.x = r.x! + r.width!;
        r.width = -r.width!;
      }
      if (r.height! < 0) {
        r.y = r.y! + r.height!;
        r.height = -r.height!;
      }
      if (r.width! > 5 && r.height! > 5) {
        snapshot();
        annotations.value.push({ ...r });
      }
      tempRect.value = null;
      drawing.value = false;
    }
  }

  function finishPolygon() {
    if (tempPoints.value.length < 6) return;
    snapshot();
    annotations.value.push({
      id: genId(),
      type: 'polygon',
      label: [],
      color: getLabelColor(),
      points: [...tempPoints.value],
    });
    tempPoints.value = [];
  }

  function onStageDblClick() {
    if (mode.value === 'polygon') finishPolygon();
  }

  function cancelPolygon() {
    tempPoints.value = [];
  }

  const nearFirstPoint = computed(() => {
    if (mode.value !== 'polygon' || tempPoints.value.length < 6) return false;
    const [fx, fy] = tempPoints.value;
    return Math.hypot(mousePos.value.x - fx, mousePos.value.y - fy) <= CLOSE_THRESHOLD;
  });

  // 检测鼠标位置是否在某个激活图形的控制点上，返回对应 cursor 或 null
  function getVertexCursorAt(pos: { x: number; y: number }): string | null {
    const activeId = hoveredId.value ?? selectedId.value;
    if (!activeId) {
      hoveredVertex.value = null;
      return null;
    }
    const ann = annotations.value.find(a => a.id === activeId);
    if (!ann) {
      hoveredVertex.value = null;
      return null;
    }
    // 根据缩放调整检测半径，保持视觉上的检测范围一致
    const hitRadius = VERTEX_HIT_RADIUS / stageScale.value;
    if (ann.type === 'rect') {
      const handles = getRectHandles(ann);
      for (let i = 0; i < handles.length; i++) {
        if (Math.hypot(pos.x - handles[i].x, pos.y - handles[i].y) <= hitRadius) {
          hoveredVertex.value = { annId: activeId, index: i };
          return HANDLE_CURSORS[handles[i].type];
        }
      }
    } else {
      const verts = getVertices(ann);
      for (let i = 0; i < verts.length; i++) {
        if (Math.hypot(pos.x - verts[i].x, pos.y - verts[i].y) <= hitRadius) {
          hoveredVertex.value = { annId: activeId, index: i };
          return 'crosshair';
        }
      }
    }
    hoveredVertex.value = null;
    return null;
  }

  // 多边形绘制中预览（>=3点即闭合显示）
  const previewPolygonPoints = computed(() => {
    if (mode.value !== 'polygon' || tempPoints.value.length < 2) return [];
    return [...tempPoints.value, mousePos.value.x, mousePos.value.y];
  });

  // 绘制中多边形是否已有 >=3 个点（可显示闭合预览）
  const polygonCanFinish = computed(() => tempPoints.value.length >= 6);

  function selectAnnotation(id: string) {
    selectedId.value = id;
  }

  function deleteSelected() {
    if (!selectedId.value) return;
    const ann = annotations.value.find(a => a.id === selectedId.value);
    if (ann?.locked) return;
    snapshot();
    annotations.value = annotations.value.filter(a => a.id !== selectedId.value);
    selectedId.value = null;
  }

  function toggleLock(id: string) {
    const ann = annotations.value.find(a => a.id === id);
    if (ann) ann.locked = !ann.locked;
  }

  function toggleVisibility(id: string) {
    const ann = annotations.value.find(a => a.id === id);
    if (ann) ann.hidden = !ann.hidden;
  }

  function toggleFixed(id: string) {
    const ann = annotations.value.find(a => a.id === id);
    if (ann) ann.fixed = !ann.fixed;
  }

  function updateAnnotation(id: string, patch: Partial<Annotation>) {
    const idx = annotations.value.findIndex(a => a.id === id);
    if (idx !== -1) {
      snapshot();
      annotations.value[idx] = { ...annotations.value[idx], ...patch };
    }
  }

  // ── 复制标注 ──────────────────────────────────────────
  // 当前待放置的复制源（画布坐标，以包围盒左上角为原点的相对点集）
  const copySource = ref<Annotation | null>(null);
  // 复制预览（跟随鼠标的幽灵标注）
  const copyGhost = ref<Annotation | null>(null);

  function startCopy(id: string) {
    const ann = annotations.value.find(a => a.id === id);
    if (!ann) return;
    copySource.value = JSON.parse(JSON.stringify(ann));
    mode.value = 'copy';
  }

  function updateCopyGhost(pos: { x: number; y: number }) {
    if (!copySource.value) return;
    const src = copySource.value;
    const color = getLabelColor();
    if (src.type === 'rect') {
      const w = src.width ?? 0,
        h = src.height ?? 0;
      copyGhost.value = { ...src, id: '__ghost__', color, x: pos.x - w / 2, y: pos.y - h / 2 };
    } else {
      const pts = src.points ?? [];
      const xs = pts.filter((_, i) => i % 2 === 0);
      const ys = pts.filter((_, i) => i % 2 !== 0);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const dx = pos.x - cx,
        dy = pos.y - cy;
      copyGhost.value = { ...src, id: '__ghost__', color, points: pts.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)) };
    }
  }

  function placeCopy(pos: { x: number; y: number }) {
    if (!copySource.value) return;
    const src = copySource.value;
    const color = getLabelColor();
    let placed: Annotation;
    if (src.type === 'rect') {
      const w = src.width ?? 0,
        h = src.height ?? 0;
      placed = { ...src, id: genId(), color, x: pos.x - w / 2, y: pos.y - h / 2, fixed: false, hidden: false, locked: false };
    } else {
      const pts = src.points ?? [];
      const xs = pts.filter((_, i) => i % 2 === 0);
      const ys = pts.filter((_, i) => i % 2 !== 0);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const dx = pos.x - cx,
        dy = pos.y - cy;
      placed = { ...src, id: genId(), color, points: pts.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)), fixed: false, hidden: false, locked: false };
    }
    snapshot();
    annotations.value.push(placed);
    cancelCopy();
  }

  function cancelCopy() {
    copySource.value = null;
    copyGhost.value = null;
    mode.value = 'select';
  }

  // ── 模型标注 ──────────────────────────────────────────

  async function autoDetect(imageBase64: string) {
    loading.value = true;
    try {
      const { data } = await axios.post<{ predictions: ModelPrediction[] }>(`base/annotate/detect`, { image: imageBase64 });
      const newAnns: Annotation[] = data.predictions.map(p => ({
        id: genId(),
        type: p.type,
        label: [],
        color: getLabelColor(),
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        points: p.points,
      }));
      snapshot();
      annotations.value.push(...newAnns);
    } finally {
      loading.value = false;
    }
  }

  async function samClick(imageBase64: string, pos: { x: number; y: number }, isBackground = false) {
    loading.value = true;
    try {
      const { data } = await axios.post<{ polygon: number[] }>(`base/annotate/sam`, { image: imageBase64, point: pos, label: isBackground ? 0 : 1 });
      if (data.polygon?.length >= 6) {
        snapshot();
        annotations.value.push({
          id: genId(),
          type: 'polygon',
          label: [],
          color: getLabelColor(),
          points: data.polygon,
        });
      }
    } finally {
      loading.value = false;
    }
  }

  // ── 导出 ──────────────────────────────────────────────

  function exportCOCO(imageWidth: number, imageHeight: number, imageName = 'image.jpg') {
    const categoryMap = new Map(labels.value.map((l, i) => [l, i + 1]));
    return {
      images: [{ id: 1, file_name: imageName, width: imageWidth, height: imageHeight }],
      categories: labels.value.map((l, i) => ({ id: i + 1, name: l })),
      annotations: annotations.value.map((ann, i) => {
        const labelStr = Array.isArray(ann.label) ? JSON.stringify(ann.label) : String(ann.label);
        const base = { id: i + 1, image_id: 1, category_id: 1, label: labelStr };
        if (ann.type === 'rect') return { ...base, bbox: [ann.x, ann.y, ann.width, ann.height], segmentation: [] };
        return { ...base, segmentation: [ann.points], bbox: pointsToBBox(ann.points!) };
      }),
    };
  }

  function exportYOLO(imageWidth: number, imageHeight: number) {
    const lines = annotations.value
      .filter(ann => ann.type === 'rect' || ann.type === 'polygon')
      .map((ann, idx) => {
        const classId = idx;
        let bx: number, by: number, bw: number, bh: number;
        if (ann.type === 'rect') {
          bx = ann.x! + ann.width! / 2;
          by = ann.y! + ann.height! / 2;
          bw = ann.width!;
          bh = ann.height!;
        } else {
          const [x, y, w, h] = pointsToBBox(ann.points!);
          bx = x + w / 2;
          by = y + h / 2;
          bw = w;
          bh = h;
        }
        return `${classId} ${(bx / imageWidth).toFixed(6)} ${(by / imageHeight).toFixed(6)} ${(bw / imageWidth).toFixed(6)} ${(bh / imageHeight).toFixed(6)}`;
      });
    return { labelsTxt: lines.join('\n'), classesTxt: annotations.value.map((_, i) => `class_${i}`).join('\n') };
  }

  function pointsToBBox(pts: number[]) {
    const xs = pts.filter((_, i) => i % 2 === 0);
    const ys = pts.filter((_, i) => i % 2 !== 0);
    const x = Math.min(...xs),
      y = Math.min(...ys);
    return [x, y, Math.max(...xs) - x, Math.max(...ys) - y];
  }

  return {
    annotations,
    mode,
    imageRotation,
    startRotate,
    updateRotate,
    endRotate,
    currentLabel,
    labels,
    selectedId,
    hoveredId,
    loading,
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
    autoDetect,
    samClick,
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
    hasUserChange,
    stageScale,
  };
}
