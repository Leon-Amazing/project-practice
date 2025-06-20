import { ref } from 'vue';
export const useLayout = () => {
  const layout = ref('vertical');
  const isCollapse = ref(false);
  const type = ref('normal');
  const isShowCollapse = ref(true);
  const sideBarTop = ref(true);
  return {
    layout,
    sideBarTop,
    isCollapse,
    type,
    isShowCollapse,
  };
};
