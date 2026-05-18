import { ref, onMounted, onUnmounted, computed, Ref } from 'vue';

export const useStageInteraction = (
  stageWidth: Ref<number>,
  stageHeight: Ref<number>,
  stageScale: Ref<number>,
  stagePos: Ref<{ x: number; y: number }>,
  isReadonly: Ref<boolean>,
  mode: Ref<string>,
  tempPoints: Ref<number[]>,
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
  handleScissorsClick,
  handleScissorsMove,
  finishScissors,
  cancelScissors,
) => {
  /* ────────────────────────────────── 画布缩放 & 平移 ────────────────────────────────── */

  const spaceDown = ref(false); // 空格键按下时进入平移模式
  const panStart = ref<{ x: number; y: number } | null>(null);
  const panOrigin = ref({ x: 0, y: 0 });

  const stageConfig = computed(() => ({
    width: stageWidth.value,
    height: stageHeight.value,
    scaleX: stageScale.value,
    scaleY: stageScale.value,
    x: stagePos.value.x,
    y: stagePos.value.y,
  }));

  // 将屏幕坐标转换为画布内容坐标（考虑 scale 和 offset）
  function screenToCanvas(screenPos: { x: number; y: number }) {
    return {
      x: (screenPos.x - stagePos.value.x) / stageScale.value,
      y: (screenPos.y - stagePos.value.y) / stageScale.value,
    };
  }

  function handleWheel(e: any) {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const oldScale = stageScale.value;
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(10, Math.max(0.1, oldScale * (1 + direction * 0.1)));

    // 以鼠标位置为缩放中心
    const mousePointTo = {
      x: (pointer.x - stagePos.value.x) / oldScale,
      y: (pointer.y - stagePos.value.y) / oldScale,
    };
    stageScale.value = newScale;
    stagePos.value = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
  }

  /* ────────────────────────────────── Stage 事件 ──────────────────────────────────────── */
  function getPos(e: any) {
    const stage = e.target.getStage();
    const p = stage.getPointerPosition();
    return screenToCanvas(p);
  }

  function handleMouseDown(e: any) {
    // 中键 或 空格+左键 → 平移（只读模式下也允许）
    if (e.evt.button === 1 || (e.evt.button === 0 && spaceDown.value)) {
      const stage = e.target.getStage();
      panStart.value = stage.getPointerPosition();
      panOrigin.value = { ...stagePos.value };
      return;
    }
    if (isReadonly.value) return;
    if (mode.value === 'copy') {
      if (e.evt.button === 2) {
        cancelCopy();
        return;
      }
      placeCopy(getPos(e));
      return;
    }
    // 处理 智能标注 模式下的点击事件
    if (mode.value === 'sam') {
      if (e.evt.button === 2) {
        finishScissors(tempPoints.value);
        return;
      }
      handleScissorsClick(getPos(e), tempPoints.value);
      return;
    }
    onStageMouseDown(getPos(e));
  }

  function handleMouseMove(e: any) {
    // 平移中
    if (panStart.value) {
      const stage = e.target.getStage();
      const p = stage.getPointerPosition();
      stagePos.value = {
        x: panOrigin.value.x + (p.x - panStart.value.x),
        y: panOrigin.value.y + (p.y - panStart.value.y),
      };
      return;
    }
    const pos = getPos(e);
    if (mode.value === 'copy') {
      updateCopyGhost(pos);
      return;
    }
    // SAM 模式下，只有绘制中时才处理 scissors，否则继续进行标注交互
    if (mode.value === 'sam') {
      handleScissorsMove(pos, tempPoints.value);
      return;
    }
    onStageMouseMove(pos);

    // 非绘制进行中时，更新 hoveredId 和端点 cursor
    const isActiveDrawing = mode.value === 'polygon' && tempPoints.value.length > 0;
    if (!isActiveDrawing && !draggingVertex.value) {
      const stage = e.target.getStage();
      const screenP = stage.getPointerPosition();
      const shapes = stage.getAllIntersections(screenP);
      const hit = [...shapes].reverse().find((s: any) => s.attrs.annId);
      hoveredId.value = hit ? hit.attrs.annId : null;

      // 端点 cursor 检测（在 hoveredId 更新后立即检测，确保用最新 activeId）
      hoveredVertexCursor.value = getVertexCursorAt(pos);
    }
  }

  function handleMouseUp(e: any) {
    if (panStart.value) {
      panStart.value = null;
      return;
    }
    onStageMouseUp();
  }

  function handleMouseLeave() {
    hoveredId.value = null;
    hoveredVertexCursor.value = null;
    hoveredVertex.value = null;
    panStart.value = null;
  }

  /* ────────────────────────────────── 键盘事件 ────────────────────────────────── */
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === ' ') {
      e.preventDefault();
      spaceDown.value = true;
    }
    if (isReadonly.value) return;
    if (e.key === 'Escape') {
      if (mode.value === 'sam') cancelScissors();
      else if (mode.value === 'copy') cancelCopy();
      else cancelPolygon();
    }
    if ((e.key === 'Enter' || e.key === 'n') && mode.value === 'polygon') finishPolygon();
    if ((e.key === 'Enter' || e.key === 'n') && mode.value === 'sam') finishScissors(tempPoints.value);
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (hoveredId.value) selectedId.value = hoveredId.value;
      deleteSelected();
    }
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      redo();
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    if (e.key === ' ') spaceDown.value = false;
  }

  // 生命周期
  onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  });

  return {
    spaceDown,
    panStart,
    stageConfig,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
