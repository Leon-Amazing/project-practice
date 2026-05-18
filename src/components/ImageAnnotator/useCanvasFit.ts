import { ref, onMounted, onUnmounted, nextTick } from 'vue';

export function useCanvasFit(imgConfig: { value: any }, annotations: { value: any[] }, stageScale: { value: number }, stagePos: { value: { x: number; y: number } }, initScissors?: () => void) {
  const stageWidth = ref(800);
  const stageHeight = ref(600);
  const stageWrapRef = ref<HTMLElement>();
  const scaleRatio = ref(1);

  // 画布坐标 → 图片原始像素坐标
  function canvasToNative(x: number, y: number) {
    const { x: ix, y: iy, width: iw, height: ih } = imgConfig.value;
    const img = imgConfig.value.image as HTMLImageElement;
    if (!img) return { x, y };
    return { x: ((x - ix) / iw) * img.naturalWidth, y: ((y - iy) / ih) * img.naturalHeight };
  }

  // 图片原始像素坐标 → 画布坐标
  function nativeToCanvas(nx: number, ny: number) {
    const { x: ix, y: iy, width: iw, height: ih } = imgConfig.value;
    const img = imgConfig.value.image as HTMLImageElement;
    if (!img) return { x: nx, y: ny };
    return { x: ix + (nx / img.naturalWidth) * iw, y: iy + (ny / img.naturalHeight) * ih };
  }

  // 标注画布坐标 → 图片原始像素坐标（保存时用）
  function annToNative(ann: any) {
    if (ann.type === 'rect') {
      const tl = canvasToNative(ann.x, ann.y);
      const br = canvasToNative(ann.x + ann.width, ann.y + ann.height);
      return { ...ann, x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y };
    } else {
      const pts = ann.points ?? [];
      const out: number[] = [];
      for (let i = 0; i < pts.length; i += 2) {
        const p = canvasToNative(pts[i], pts[i + 1]);
        out.push(p.x, p.y);
      }
      return { ...ann, points: out };
    }
  }

  // 图片原始像素坐标 → 标注画布坐标（加载时用）
  function annFromNative(ann: any) {
    if (ann.type === 'rect') {
      const tl = nativeToCanvas(ann.x, ann.y);
      const br = nativeToCanvas(ann.x + ann.width, ann.y + ann.height);
      return { ...ann, x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y };
    } else {
      const pts = ann.points ?? [];
      const out: number[] = [];
      for (let i = 0; i < pts.length; i += 2) {
        const p = nativeToCanvas(pts[i], pts[i + 1]);
        out.push(p.x, p.y);
      }
      return { ...ann, points: out };
    }
  }

  function fitStageToContainer() {
    if (!stageWrapRef.value) return;
    const containerWidth = stageWrapRef.value.clientWidth;
    const containerHeight = window.innerHeight - 190;

    if (!containerWidth) return;

    // Stage 始终填满容器
    stageWidth.value = containerWidth;
    stageHeight.value = containerHeight;

    if (imgConfig.value.image) {
      // resize 前先把当前标注转为图片原始像素坐标
      const nativeAnns = annotations.value.length > 0 && imgConfig.value.width > 0 ? annotations.value.map(annToNative) : null;

      const img = imgConfig.value.image as HTMLImageElement;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const containerRatio = containerWidth / containerHeight;

      let imgWidth, imgHeight;
      if (imgRatio > containerRatio) {
        // 图片更宽，以宽度为准
        imgWidth = containerWidth * 0.8; // 留 20% 边距
        imgHeight = imgWidth / imgRatio;
      } else {
        // 图片更高，以高度为准
        imgHeight = containerHeight * 0.8;
        imgWidth = imgHeight * imgRatio;
      }

      // 图片居中显示
      const imgX = (containerWidth - imgWidth) / 2;
      const imgY = (containerHeight - imgHeight) / 2;

      imgConfig.value = {
        image: img,
        x: imgX,
        y: imgY,
        width: imgWidth,
        height: imgHeight,
      };
      scaleRatio.value = imgWidth / img.naturalWidth;
      stageScale.value = 1;
      stagePos.value = { x: 0, y: 0 };

      // 用新 imgConfig 把图片原始像素坐标转回画布坐标
      if (nativeAnns) {
        annotations.value = nativeAnns.map(annFromNative);
      }
      nextTick(() => initScissors && initScissors());
    }
  }

  onMounted(() => {
    window.addEventListener('resize', fitStageToContainer);
    fitStageToContainer();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', fitStageToContainer);
  });

  return {
    stageWrapRef,
    stageWidth,
    stageHeight,
    scaleRatio,
    fitStageToContainer,
    annToNative,
    annFromNative,
  };
}
