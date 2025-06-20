import * as echarts from 'echarts';
import { ref } from 'vue';
import geoJSON from './geo.json';
// import { getGeoJSONCenter, rotateGeoJSON } from '@/utils/utils';

// 获取中心并且旋转
// const center = getGeoJSONCenter(geoJSON); // [经度, 纬度]
// const rotatedGeoJSON = rotateGeoJSON(geoJSON, -15, center);

export const allEcharts: any = [];
const colors1 = [
  { offset: 0, color: '#14F6BE' },
  { offset: 0.1, color: '#0D93F5' },
  { offset: 0.4, color: '#F59310' },
  { offset: 1, color: '#FF6F70' },
];
const colors2 = [
  { offset: 0.1, color: '#0D93F5' },
  { offset: 0.4, color: '#F59310' },
  { offset: 1, color: '#FF6F70' },
];
const colors3 = [
  { offset: 0.4, color: '#F59310' },
  { offset: 1, color: '#FF6F70' },
];
const colors4 = [{ offset: 1, color: '#FF6F70' }];
const colors11 = [
  { offset: 0, color: '#257994' },
  { offset: 0.1, color: '#265BA2' },
  { offset: 0.4, color: '#695B61' },
  { offset: 1, color: '#6C517C' },
];
const colors22 = [
  { offset: 0.1, color: '#265BA2' },
  { offset: 0.4, color: '#695B61' },
  { offset: 1, color: '#6C517C' },
];
const colors33 = [
  { offset: 0.4, color: '#695B61' },
  { offset: 1, color: '#6C517C' },
];
const colors44 = [{ offset: 1, color: '#6C517C' }];
function getColor(value: number) {
  if (value >= 90) {
    return colors1;
  } else if (value >= 80) {
    return colors2;
  } else if (value >= 60) {
    return colors3;
  } else {
    return colors4;
  }
}
function getColor2(value: number) {
  if (value >= 90) {
    return colors11;
  } else if (value >= 80) {
    return colors22;
  } else if (value >= 60) {
    return colors33;
  } else {
    return colors44;
  }
}
export function creatBarChart({ dom, data, xData, xTitle = '横坐标', unit = '%', yName = '纵坐标', ids = [] }) {
  const barchart = echarts.init(dom, null, {
    renderer: 'svg',
  });

  const option = {
    tooltip: {
      trigger: 'axis',
      textStyle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
      },
      backgroundColor: 'rgba(50, 50, 50, 0.7)',
      borderColor: '#aaa',
      borderWidth: 1,
      padding: 10,
      formatter: function (params: any) {
        const value = params[0].value;
        const name = params[0].name;
        return `<div style="color: #fff; font-size: 14px;">
                  <strong>${name}</strong><br/>
                  ${yName}: ${value}${unit}
                </div>`;
      },
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        maxValueSpan: 7,
        startValue: 0,
        endValue: 6, // 显示7个柱子（索引0~6）
        bottom: 30,
        height: 8, // 调整滑块的高度
        handleSize: '100%',
        handleStyle: {
          color: '#aaa',
        },
        backgroundColor: '#053b9f',
        borderColor: '#053b9f',
        moveHandleStyle: {
          borderType: 'dashed',
        },
        textStyle: {
          color: 'transparent',
        },
        brushSelect: false,
      },
    ],
    grid: {
      left: 20,
      right: 50,
      top: 50,
      bottom: 50,
      containLabel: true, // 确保标签不会被裁剪
    },
    xAxis: {
      name: xTitle,
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
      },
      data: xData,
      axisLabel: {
        color: '#ffffff',
        interval: 0,
        formatter: function (value: any) {
          if (value.length > 4) {
            return value.substring(0, 4) + '..';
          } else {
            return value;
          }
        },
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      name: yName,
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        align: 'right',
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
          type: 'dashed',
        },
      },
    },
    // 立方体柱状
    series: [
      {
        type: 'custom',
        data:
          ids.length == 0
            ? data
            : data.map((item: any, index: number) => {
                return {
                  value: item,
                  id: ids[index],
                };
              }), // 只显示ids中的数据
        renderItem: (params, api) => {
          const basicsCoord = api.coord([api.value(0), api.value(1)]);
          const topBasicsYAxis = basicsCoord[1];
          const basicsXAxis = basicsCoord[0];
          const bottomYAxis = api.coord([api.value(0), 0])[1];
          return {
            type: 'group',
            children: [
              {
                type: 'text',
                style: {
                  text: `${data[params.dataIndex]}${unit}`,
                  x: basicsXAxis,
                  y: 40,
                  fill: '#fff',
                  font: '14px sans-serif',
                  align: 'center',
                  verticalAlign: 'bottom',
                },
              },
              // 左侧
              {
                type: 'polygon',
                shape: {
                  points: [
                    [basicsXAxis - 10, topBasicsYAxis - 4],
                    [basicsXAxis - 10, bottomYAxis],
                    [basicsXAxis, bottomYAxis],
                    [basicsXAxis, topBasicsYAxis],
                  ],
                },
                style: {
                  fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, getColor2(data[params.dataIndex])),
                },
              },
              // 右侧
              {
                type: 'polygon',
                shape: {
                  points: [
                    [basicsXAxis, topBasicsYAxis],
                    [basicsXAxis, bottomYAxis],
                    [basicsXAxis + 10, bottomYAxis],
                    [basicsXAxis + 10, topBasicsYAxis - 4],
                  ],
                },
                style: {
                  fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, getColor(data[params.dataIndex])),
                },
              },
              // 顶部
              {
                type: 'polygon',
                shape: {
                  points: [
                    [basicsXAxis, topBasicsYAxis],
                    [basicsXAxis - 10, topBasicsYAxis - 4],
                    [basicsXAxis, topBasicsYAxis - 8],
                    [basicsXAxis + 10, topBasicsYAxis - 4],
                  ],
                },
                style: {
                  fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: getColor(data[params.dataIndex])[0].color }]),
                },
              },
            ],
          };
        },
      },
      {
        type: 'custom',
        data: new Array(data.length).fill(100), // Always 100% height
        renderItem: (_, api) => {
          const basicsCoord = api.coord([api.value(0), api.value(1)]);
          const topBasicsYAxis = basicsCoord[1];
          const basicsXAxis = basicsCoord[0];
          const bottomYAxis = api.coord([api.value(0), 0])[1];
          return {
            type: 'group',
            children: [
              // Left face (dotted)
              {
                type: 'polygon',
                shape: {
                  points: [
                    [basicsXAxis - 10, topBasicsYAxis - 4],
                    [basicsXAxis - 10, bottomYAxis],
                    [basicsXAxis, bottomYAxis],
                    [basicsXAxis, topBasicsYAxis],
                  ],
                },
                style: {
                  fill: '#032F80',
                },
              },
              // Right face (dotted)
              {
                type: 'polygon',
                shape: {
                  points: [
                    [basicsXAxis, topBasicsYAxis],
                    [basicsXAxis, bottomYAxis],
                    [basicsXAxis + 10, bottomYAxis],
                    [basicsXAxis + 10, topBasicsYAxis - 4],
                  ],
                },
                style: {
                  fill: '#032F80',
                },
              },
              // Top face (dotted)
              {
                type: 'polygon',
                shape: {
                  points: [
                    [basicsXAxis, topBasicsYAxis],
                    [basicsXAxis - 10, topBasicsYAxis - 4],
                    [basicsXAxis, topBasicsYAxis - 8],
                    [basicsXAxis + 10, topBasicsYAxis - 4],
                  ],
                },
                style: {
                  fill: '#032F80',
                },
              },
            ],
          };
        },
        silent: true, // Makes it non-interactive
        z: -1, // Puts it behind the main bars
      },
    ],
  };
  option && barchart.setOption(option);

  return barchart;
}

export const isFullscreen = ref(false);

export const isShowTotalTip = ref(true);
export function creatMapChart({ dom, data }) {
  function getColor(value) {
    if (value < 60) return '#FF6F70';
    else if (value < 80) return '#F59310';
    else if (value < 90) return '#0D93F5';
    else return '#14F6BE';
  }
  const myChart: any = echarts.init(dom, null, {
    renderer: 'svg',
  });
  (echarts as any).registerMap('china', geoJSON);
  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'click', // 只在点击时显示tooltip
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      // enterable: true, // 允许鼠标进入tooltip
      formatter: function (params) {
        if (!params.data) return '';
        const d = params.data;
        return `
          <div style="
            background: #032F80;
            border-radius: 4px;
            padding: 17px 15px;
            color: white;
            min-width: 210px;
            font-size: 14px;
            ">
            <div style="font-size:16px; font-weight:bold; margin-bottom:12px;">${d.name}</div>
            <div style="margin-bottom:5px;">数量: <span style="color: #03F5B8;font-weight: bold">${d.value}</span></div>
          </div>
        `;
      },
    },
    visualMap: {
      show: false,
      type: 'piecewise', // 分段型
      pieces: [
        { min: 90, max: 100, label: '高 (>=800)', color: '#14F6BE' },
        { min: 80, max: 89, label: '高 (>=800)', color: '#0D93F5' },
        { min: 60, max: 79, label: '中 (500-799)', color: '#F59310' },
        { min: 0, max: 59, label: '低 (0-499)', color: '#FF6F70' },
      ],
    },
    geo: [
      {
        animationDurationUpdate: 0, // 跟随图层动画必须关闭，否则会出现图层分离的现象
        roam: false, // 禁用底图，底图坐标跟随顶层图层
        zoom: 1.2,
        aspectScale: 1, // 长宽比
        map: 'china',
        layoutCenter: ['50%', '50%'],
        layoutSize: '100%',
        emphasis: {
          disabled: true,
        },
        itemStyle: {
          areaColor: '#2a78a4',
          borderColor: '#2a78a4',
          borderWidth: 1,
          shadowColor: '#2a78a4',
          shadowOffsetX: -10, // 阴影水平偏移
          shadowOffsetY: 5, // 阴影垂直偏移
        },
      },
      {
        type: 'map',
        map: 'china',
        roam: true,
        zoom: 1.2,
        aspectScale: 1,
        select: {
          itemStyle: {
            areaColor: '#1A4AA5',
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 1)',
          },
        },
        emphasis: {
          itemStyle: {
            areaColor: '#1A4AA5',
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 1)',
          },
        },
        itemStyle: {
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 1,
        },
        label: {
          show: true,
          formatter: function () {
            return '';
          },
        },
      },
    ],
    series: [
      {
        name: '投保率',
        type: 'map',
        map: 'china',
        geoIndex: 1, // 绑定geo组件
        data: data.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            areaColor: getColor(item.value),
          },
        })),
      },
    ],
    graphic: [],
  };
  option && myChart.setOption(option);

  let clickedOnChart = false;

  myChart.setOption({
    graphic: [],
  });

  // 添加点击事件
  let selectedName = null;
  myChart.on('click', function (params) {
    selectedName = params.name;
    isShowTotalTip.value = false;
    clickedOnChart = true;
    myChart.dispatchAction({
      type: 'mapSelect',
      name: selectedName,
    });
    myChart.setOption({
      graphic: [
        {
          type: 'image',
          id: 'arrow',
          style: {
            image: '/images/map_location.png', // 替换成你的箭头图片地址
            width: 51,
            height: 49,
          },
          position: [params.event.offsetX - 25.5, params.event.offsetY - 35],
          z: 1000,
        },
      ],
    });
  });

  // 监听地图缩放和平移事件
  myChart.on('georoam', function (params) {
    // 让底层图跟随顶层图
    const options = myChart.getOption();
    const [bottomLayer, topLayer] = options.geo as Array<any>;
    const { center, zoom } = topLayer;
    bottomLayer.center = center;
    bottomLayer.zoom = zoom;
    myChart.setOption(options);

    // 清除其他
    myChart.dispatchAction({
      type: 'hideTip',
    });
    myChart.dispatchAction({
      type: 'mapUnSelect',
      name: selectedName,
    });
    myChart.setOption({
      graphic: [
        {
          type: 'image',
          id: 'arrow',
          style: {
            width: 0,
            height: 0,
          },
          position: [],
        },
      ],
    });
  });

  // 监听容器原生点击事件
  dom.addEventListener('click', () => {
    if (!clickedOnChart) {
      isShowTotalTip.value = true;
      myChart.dispatchAction({
        type: 'mapUnSelect',
        name: selectedName,
      });
      myChart.setOption({
        graphic: [
          {
            type: 'image',
            id: 'arrow',
            style: {
              width: 0,
              height: 0,
            },
            position: [],
          },
        ],
      });
    }
    clickedOnChart = false; // 重置标志
  });
  return myChart;
}
