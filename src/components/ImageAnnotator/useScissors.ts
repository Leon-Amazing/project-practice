import { nextTick, onMounted, onUnmounted, ref } from 'vue';

declare const cv: any;

export function useScissors(imgConfig: () => { image: HTMLImageElement | null; x: number; y: number; width: number; height: number }, onFinish: () => void, onCancel: () => void) {
  // OpenCV 相关变量
  let cvInstance: any = null;
  let scissorsTool: any = null;
  let scissorsSrc: any = null;
  let scissorsHasMap = false;

  // 已确认的点（画布坐标）
  const scissorsConfirmedPoints = ref<{ x: number; y: number }[]>([]);
  // 预览点（画布坐标，用于 Konva 渲染）
  const scissorsPreviewPoints = ref<number[]>([]);
  // 是否有足够的点可以闭合
  const scissorsHasEnoughPoints = ref(false);

  // RDP 抽稀容差
  const SAMEpsilon = ref(10);
  const rdpEpsilon = ref(8.5);

  // 将画布坐标转换为图片原始坐标
  function canvasPosToImgNative(pos: { x: number; y: number }) {
    const { x: ix, y: iy, width: iw, height: ih } = imgConfig();
    const img = imgConfig().image;
    if (!img) return null;
    return {
      x: Math.round(((pos.x - ix) / iw) * img.naturalWidth),
      y: Math.round(((pos.y - iy) / ih) * img.naturalHeight),
    };
  }

  // 将图片原始坐标转换为画布坐标
  function imgNativeToCanvasPos(nx: number, ny: number) {
    const { x: ix, y: iy, width: iw, height: ih } = imgConfig();
    const img = imgConfig().image as HTMLImageElement;
    if (!img) return { x: 0, y: 0 };
    return {
      x: ix + (nx / img.naturalWidth) * iw,
      y: iy + (ny / img.naturalHeight) * ih,
    };
  }

  // RDP 算法抽稀
  function rdpSimplify(pts: number[], epsilon: number): number[] {
    if (pts.length < 6) return pts;
    const points: [number, number][] = [];
    for (let i = 0; i < pts.length; i += 2) points.push([pts[i], pts[i + 1]]);

    function perpendicularDist(p: [number, number], a: [number, number], b: [number, number]) {
      const dx = b[0] - a[0],
        dy = b[1] - a[1];
      if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
      return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / Math.hypot(dx, dy);
    }

    function rdp(start: number, end: number, result: boolean[]) {
      let maxDist = 0,
        maxIdx = start;
      for (let i = start + 1; i < end; i++) {
        const d = perpendicularDist(points[i], points[start], points[end]);
        if (d > maxDist) {
          maxDist = d;
          maxIdx = i;
        }
      }
      if (maxDist > epsilon) {
        rdp(start, maxIdx, result);
        result[maxIdx] = true;
        rdp(maxIdx, end, result);
      }
    }

    const keep = new Array(points.length).fill(false);
    keep[0] = true;
    keep[points.length - 1] = true;
    rdp(0, points.length - 1, keep);
    const result: number[] = [];
    for (let i = 0; i < points.length; i++) {
      if (keep[i]) result.push(points[i][0], points[i][1]);
    }
    return result;
  }

  // 初始化智能剪刀
  function initScissors() {
    if (!cvInstance || !imgConfig().image) return;
    const img = imgConfig().image as HTMLImageElement;

    // 创建离屏 canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    if (scissorsSrc) scissorsSrc.delete();
    if (scissorsTool) scissorsTool.delete();

    scissorsSrc = cvInstance.imread(canvas);
    scissorsTool = new cvInstance.segmentation_IntelligentScissorsMB();
    scissorsTool.setEdgeFeatureCannyParameters(32, 100);
    scissorsTool.setGradientMagnitudeMaxLimit(200);
    scissorsTool.applyImage(scissorsSrc);

    scissorsHasMap = false;
    scissorsConfirmedPoints.value = [];
    scissorsPreviewPoints.value = [];
    scissorsHasEnoughPoints.value = false;
  }

  // 绘制预览(使用 Konva 组件渲染，不再使用原生 canvas)
  function drawScissorsPreview(canvasPoints: number[], hasEnoughPoints: boolean = false) {
    scissorsPreviewPoints.value = canvasPoints;
    scissorsHasEnoughPoints.value = hasEnoughPoints;
  }

  // 处理鼠标点击
  function handleScissorsClick(canvasPos: { x: number; y: number }, tempPoints: number[]) {
    if (!scissorsTool || !scissorsSrc) return;
    const imgPos = canvasPosToImgNative(canvasPos);
    if (!imgPos) return;
    const img = imgConfig().image as HTMLImageElement;
    if (imgPos.x < 0 || imgPos.x >= img.naturalWidth || imgPos.y < 0 || imgPos.y >= img.naturalHeight) return;

    if (!scissorsHasMap) {
      // 第一次点击，初始化
      scissorsTool.buildMap(new cvInstance.Point(imgPos.x, imgPos.y));
      scissorsHasMap = true;
      scissorsConfirmedPoints.value = [canvasPos];
    } else {
      // 获取轮廓
      const contour = new cvInstance.Mat();
      scissorsTool.getContour(new cvInstance.Point(imgPos.x, imgPos.y), contour);

      // 将轮廓点转为画布坐标并抽稀
      const rawPts: number[] = [];
      for (let i = 0; i < contour.rows; i++) {
        const cp = imgNativeToCanvasPos(contour.intAt(i, 0), contour.intAt(i, 1));
        rawPts.push(cp.x, cp.y);
      }
      contour.delete();

      // RDP 抽稀
      const epsilon = SAMEpsilon.value - rdpEpsilon.value;
      const simplified = rdpSimplify(rawPts, epsilon);
      tempPoints.push(...simplified);

      scissorsConfirmedPoints.value.push(canvasPos);
      scissorsTool.buildMap(new cvInstance.Point(imgPos.x, imgPos.y));
    }
  }

  // 处理鼠标移动
  function handleScissorsMove(canvasPos: { x: number; y: number }, tempPoints: number[]) {
    if (!scissorsTool || !scissorsHasMap) return;
    const imgPos = canvasPosToImgNative(canvasPos);
    if (!imgPos) return;
    const img = imgConfig().image as HTMLImageElement;
    if (imgPos.x < 0 || imgPos.x >= img.naturalWidth || imgPos.y < 0 || imgPos.y >= img.naturalHeight) return;

    // 超过两个点时，预览闭合区域
    const hasEnoughPoints = scissorsConfirmedPoints.value.length >= 2;

    const contour = new cvInstance.Mat();
    scissorsTool.getContour(new cvInstance.Point(imgPos.x, imgPos.y), contour);

    // 已确认路径
    const allCanvasPts: number[] = [...tempPoints];
    // 当前预览轮廓（抽稀后）
    const previewRaw: number[] = [];
    for (let i = 0; i < contour.rows; i++) {
      const cp = imgNativeToCanvasPos(contour.intAt(i, 0), contour.intAt(i, 1));
      previewRaw.push(cp.x, cp.y);
    }
    contour.delete();

    const epsilon = SAMEpsilon.value - rdpEpsilon.value;
    const previewSimplified = rdpSimplify(previewRaw, epsilon);
    allCanvasPts.push(...previewSimplified);

    drawScissorsPreview(allCanvasPts, hasEnoughPoints);
  }

  // 完成智能剪刀绘制
  function finishScissors(tempPoints: number[]) {
    if (tempPoints.length < 6) return;
    onFinish();
    resetScissors();
  }

  // 取消智能剪刀绘制
  function cancelScissors() {
    resetScissors();
    onCancel();
  }

  // 重置智能剪刀状态
  function resetScissors() {
    scissorsHasMap = false;
    scissorsConfirmedPoints.value = [];
    scissorsPreviewPoints.value = [];
    scissorsHasEnoughPoints.value = false;
  }

  // 释放资源
  function releaseScissors() {
    if (scissorsSrc) {
      scissorsSrc.delete();
      scissorsSrc = null;
    }
    if (scissorsTool) {
      scissorsTool.delete();
      scissorsTool = null;
    }
    resetScissors();
  }

  // 初始化 OpenCV
  async function initOpenCV() {
    if (typeof cv !== 'undefined') {
      const ready = typeof cv.then === 'function' ? cv : Promise.resolve(cv);
      ready.then((instance: any) => {
        cvInstance = instance;
        nextTick(() => initScissors());
      });
    }
  }

  onMounted(() => {
    initOpenCV();
  });
  onUnmounted(() => {
    releaseScissors();
  });

  return {
    // 状态
    scissorsConfirmedPoints,
    scissorsPreviewPoints,
    scissorsHasEnoughPoints,
    SAMEpsilon,
    rdpEpsilon,
    // 方法
    initScissors,
    handleScissorsClick,
    handleScissorsMove,
    finishScissors,
    cancelScissors,
    releaseScissors,
    initOpenCV,
    resetScissors,
  };
}
