import { ref } from 'vue';
import { nextTick } from 'vue';

export function useImageLoader(imgConfig: { value: any }, fitStageToContainer: () => void, initScissors?: () => void) {
  const imageBase64 = ref('');
  function loadImage(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      imageBase64.value = (e.target!.result as string).split(',')[1];
      const img = new Image();
      img.src = e.target!.result as string;
      img.onload = () => {
        imgConfig.value.image = img;
        fitStageToContainer();
        nextTick(() => initScissors && initScissors());
      };
    };
    reader.readAsDataURL(file);
  }

  async function loadImageFromUrl(url: string) {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();

      // 处理跨域问题（CDN 服务器需配置正确的 CORS 头）
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // 将图片转换为 Base64 格式（保持与原有逻辑一致）
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          imageBase64.value = canvas.toDataURL('image/png').split(',')[1];
        }
        imgConfig.value.image = img;
        fitStageToContainer();
        nextTick(() => initScissors && initScissors());
        resolve();
      };

      img.onerror = () => {
        console.error('图片加载失败:', url);
        img.crossOrigin = '';
        img.src = url;

        img.onload = () => {
          imgConfig.value.image = img;
          fitStageToContainer();
          nextTick(() => initScissors && initScissors());
          resolve();
        };

        img.onerror = () => {
          console.error('图片加载失败（第二次尝试）:', url);
          reject(new Error('图片加载失败'));
        };
      };

      // 设置超时机制（防止长时间等待）
      setTimeout(() => {
        if (!img.complete) {
          img.src = ''; // 中止加载
          reject(new Error('图片加载超时'));
        }
      }, 30000); // 30秒超时

      img.src = url;
    });
  }

  return {
    imageBase64,
    loadImage,
    loadImageFromUrl,
  };
}
