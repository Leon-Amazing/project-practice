<template>
  <div id="data-screen" class="data-screen" ref="dataScreenRef">
    <div class="headline">数据大屏</div>
    <el-icon @click="switchFullScreen"><FullScreen /></el-icon>
    <div class="main-content">
      <div class="left-content">
        <div class="chart" ref="barChart"></div>
      </div>
      <div class="center-content">
        <div class="chart" ref="mapChart"></div>
      </div>
      <div class="right-content">
        <div class="seamless-list">
          <SeamlessScroll />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import SeamlessScroll from '@/components/SeamlessScroll.vue';
import { allEcharts, creatBarChart, creatMapChart, isFullscreen } from './config';
import useScreenFull from '@/hooks/useScreenFull';

const { fullScreen, removeFullScreenListen } = useScreenFull();

const barChart = ref();
const mapChart = ref();
function switchFullScreen() {
  isFullscreen.value = !isFullscreen.value;
  fullScreen('.data-screen', isFullscreen.value);
}
function initEchart(type = 1) {
  let myChart;
  // 柱状图
  if (type == 1) {
    const data = [94, 94, 84, 83, 77, 77, 73, 72, 70, 62, 60] as number[];
    const xData = ['企业1', '企业2', '企业3', '企业4', '企业5', '企业6', '企业7', '企业8', '企业9', '企业10', '企业11'] as string[];
    myChart = creatBarChart({ dom: barChart.value, data, xData });
  }
  // 地图
  if (type == 2) {
    const data = [
      { name: '北京市', value: 82 },
      { name: '天津市', value: 67 },
      { name: '河北省', value: 45 },
      { name: '山西省', value: 53 },
      { name: '内蒙古自治区', value: 38 },
      { name: '辽宁省', value: 74 },
      { name: '吉林省', value: 59 },
      { name: '黑龙江省', value: 41 },
      { name: '上海市', value: 90 },
      { name: '江苏省', value: 77 },
      { name: '浙江省', value: 88 },
      { name: '安徽省', value: 62 },
      { name: '福建省', value: 70 },
      { name: '江西省', value: 55 },
      { name: '山东省', value: 80 },
      { name: '河南省', value: 60 },
      { name: '湖北省', value: 73 },
      { name: '湖南省', value: 65 },
      { name: '广东省', value: 95 },
      { name: '广西壮族自治区', value: 50 },
      { name: '海南省', value: 68 },
      { name: '重庆市', value: 58 },
      { name: '四川省', value: 85 },
      { name: '贵州省', value: 47 },
      { name: '云南省', value: 52 },
      { name: '西藏自治区', value: 20 },
      { name: '陕西省', value: 63 },
      { name: '甘肃省', value: 36 },
      { name: '青海省', value: 29 },
      { name: '宁夏回族自治区', value: 33 },
      { name: '新疆维吾尔自治区', value: 40 },
      { name: '香港特别行政区', value: 91 },
      { name: '澳门特别行政区', value: 87 },
      { name: '台湾省', value: 78 },
    ];
    myChart = creatMapChart({
      dom: mapChart.value,
      data,
    });
  }
  const isExist = allEcharts.find(item => item.id == myChart.id);
  if (!isExist) {
    allEcharts.push(myChart);
  }
}

function resize() {
  allEcharts.forEach(echart => {
    echart.resize();
  });
}
onMounted(async () => {
  initEchart(1);
  initEchart(2);
});
onBeforeUnmount(() => {
  removeFullScreenListen();
  window.removeEventListener('resize', resize);
});
</script>

<style scoped lang="scss">
.data-screen {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  /* 动感深色渐变背景 */
  background: linear-gradient(120deg, #232a4d 0%, #1a2a6c 50%, #4f5bd5 100%);
  /* 光斑特效 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.25;
    z-index: 1;
    pointer-events: none;
  }
  &::before {
    width: 400px;
    height: 400px;
    left: 10%;
    top: 10%;
    background: #00c3ff;
    animation: move1 12s infinite alternate;
  }
  &::after {
    width: 300px;
    height: 300px;
    right: 10%;
    bottom: 10%;
    background: #6e45e2;
    animation: move2 14s infinite alternate;
  }
  @keyframes move1 {
    0% {
      left: 10%;
      top: 10%;
    }
    100% {
      left: 25%;
      top: 25%;
    }
  }
  @keyframes move2 {
    0% {
      right: 10%;
      bottom: 10%;
    }
    100% {
      right: 20%;
      bottom: 20%;
    }
  }

  .el-icon {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 24px;
    cursor: pointer;
    z-index: 12;
    color: #00c3ff;
  }

  .headline {
    font-size: 2.5rem;
    letter-spacing: 4px;
    font-weight: bold;
    line-height: 1.2;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 38px;
    z-index: 2;
    background: linear-gradient(90deg, #00c3ff, #6e45e2, #ff6a00);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 4px 32px rgba(110, 69, 226, 0.25);
    animation: shine 3s linear infinite;
  }
  @keyframes shine {
    0% {
      filter: brightness(1.1);
    }
    50% {
      filter: brightness(1.4);
    }
    100% {
      filter: brightness(1.1);
    }
  }

  .main-content {
    width: 100%;
    height: 100%;
    display: flex;
    padding-top: 110px;
    position: relative;
    z-index: 2;
    box-sizing: border-box;
  }

  .left-content,
  .right-content {
    width: 25%;
    height: 100%;
    margin: 0 1vw;
    padding: 28px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: rgba(36, 54, 110, 0.82);
    border-radius: 22px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
    border: 1.5px solid rgba(110, 69, 226, 0.18);
    backdrop-filter: blur(8px);
    transition: box-shadow 0.3s;
    position: relative;
    overflow: hidden;
  }

  .center-content {
    width: 50%;
    height: 100%;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: rgba(10, 50, 136, 0.92);
    border-radius: 28px;
    box-shadow: 0 8px 32px 0 rgba(110, 69, 226, 0.18);
    border: 1.5px solid rgba(0, 195, 255, 0.18);
    backdrop-filter: blur(10px);
    margin: 0 1vw;
    position: relative;
    overflow: hidden;
    .chart {
      height: 85%;
      margin-top: 60px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.03);
      box-shadow: 0 2px 12px rgba(110, 69, 226, 0.08);
      border: 1px solid rgba(110, 69, 226, 0.08);
    }
  }

  .chart {
    height: 40%;
    width: 100%;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 2px 12px rgba(110, 69, 226, 0.08);
    border: 1px solid rgba(110, 69, 226, 0.08);
    margin-bottom: 18px;
  }

  .seamless-list {
    height: 50%;
    overflow: hidden;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 2px 12px rgba(110, 69, 226, 0.08);
    border: 1px solid rgba(110, 69, 226, 0.08);
  }
}
</style>
