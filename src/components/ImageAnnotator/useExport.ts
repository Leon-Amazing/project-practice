import { Ref } from 'vue';

export const useExport = (imgConfig: Ref<{ width: number; height: number }>, scaleRatio: Ref<number>, emit: any, exportCOCO: any, exportYOLO: any) => {
  function downloadText(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  function handleExport() {
    const coco = exportCOCO(imgConfig.value.width / scaleRatio.value, imgConfig.value.height / scaleRatio.value);
    emit('save', coco);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(coco, null, 2)], { type: 'application/json' }));
    a.download = 'annotations.json';
    a.click();
  }

  function handleExportYOLO() {
    const { labelsTxt, classesTxt } = exportYOLO(imgConfig.value.width / scaleRatio.value, imgConfig.value.height / scaleRatio.value);
    downloadText(labelsTxt, 'labels.txt');
    downloadText(classesTxt, 'classes.txt');
  }

  return {
    handleExport,
    handleExportYOLO,
  };
};
