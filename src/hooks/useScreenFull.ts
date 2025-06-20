import screenfull from 'screenfull';
import { ref, nextTick } from 'vue';
export default function useScreenFull() {
  const isFull = ref(false);
  const fullScreen = (className: string, isOpen: boolean) => {
    nextTick(() => {
      if (screenfull.isEnabled && isOpen) {
        screenfull.request(document.querySelector(className)!);
      } else {
        screenfull.toggle();
      }
    });
  };

  function fullScreenChange() {
    if (document.fullscreenElement) {
      isFull.value = true;
    } else {
      isFull.value = false;
    }
  }

  /* 监听全屏*/
  addFullScreenListen();
  function addFullScreenListen() {
    document.addEventListener('fullscreenchange', fullScreenChange);
  }
  /* 移除监听 */
  function removeFullScreenListen() {
    document.removeEventListener('fullscreenchange', fullScreenChange);
  }

  return {
    isFull,
    fullScreen,
    removeFullScreenListen,
  };
}
