// 动态修改标题
export const useDynamicTitle = (title: string) => {
  document.title = title || import.meta.env.VITE_APP_TITLE;
};
