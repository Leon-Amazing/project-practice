import { DrawMode } from './types';

export const useTools = () => {
  // 工具栏
  const tools: { value: DrawMode; label: string; icon: string; activeIcon: string }[] = [
    { value: 'select', label: '选择', icon: '/images/select.png', activeIcon: '/images/select_active.png' },
    { value: 'rotate', label: '旋转', icon: '/images/rotate.png', activeIcon: '/images/rotate_active.png' },
    { value: 'sam', label: '智能标注', icon: '/images/magic.png', activeIcon: '/images/magic_active.png' },
    { value: 'ai', label: 'AI', icon: '/images/ai.png', activeIcon: '/images/ai_active.png' },
    { value: 'rect', label: '矩形', icon: '/images/rectangle.png', activeIcon: '/images/rectangle_active.png' },
    { value: 'polygon', label: '多边形', icon: '/images/polygon.png', activeIcon: '/images/polygon_active.png' },
    { value: 'point', label: '点', icon: '/images/dot.png', activeIcon: '/images/dot_active.png' },
  ];

  // 颜色辅助
  function hexToRgba(hex: string, alpha = 0.2) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function rotatePoint(p: { x: number; y: number }, cx: number, cy: number, cos: number, sin: number) {
    const dx = p.x - cx,
      dy = p.y - cy;
    return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
  }

  return {
    tools,
    hexToRgba,
    rotatePoint,
  };
};
