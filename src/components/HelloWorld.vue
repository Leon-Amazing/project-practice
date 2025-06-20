<template>
  <h1>{{ msg }}</h1>
  <div>{{ t('common.hello') }}</div>
</template>
<script setup lang="ts" name="HelloWord">
import { getCurrentInstance, ref, reactive, watch, watchEffect, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { useI18n } from 'vue-i18n';
// 获取vue实例
const instance = getCurrentInstance() as ComponentInternalInstance;
const proxy: any = instance?.proxy;
// props的写法 其中withDefaults、defineProps、defineEmits、defineExpose无需从Vue中引入，运行和打包时，会自动去引入
// withDefaults的写法为上面是声明类型，下面为默认值，如果默认值没有填写，说明该值为必填
interface PropsEx {
  text: string;
  icon?: string;
}
const props = withDefaults(
  defineProps<{
    // 必填项
    msg: string;
    // 不必填项，且默认值为1
    num?: number;
    // 不必填项，且没有默认值
    str?: string;
    // 如果类型为对象，默认值需要用一个Function去return出一个对应的对象
    propsEx?: PropsEx;
    // 如果类型为数组，默认值需要用一个Function去return出一个对应的数组
    propsArrEx?: PropsEx[];
  }>(),
  {
    num: 1,
    str: undefined,
    propsEx: () => {
      return {
        text: 'Hello CTY CMS UI'
      };
    },
    propsArrEx: () => []
  }
);

// script 多语言的使用方式
const { t } = useI18n();
console.log(t('common.hello'));
console.log(proxy.$t('common.hello'));

// ref, reactive 是将普通对象转成proxy对象，让其变成响应式，其中ref是对基本类型使用，reactive是对引用类型使用
const refEx = ref<string>('');
interface RefArrEx {
  text: string;
  icon?: string;
}
const refArrEx = ref<RefArrEx[]>([]);
interface ReactiveEx {
  text: string;
  icon?: string;
}
const reactiveEx = reactive<ReactiveEx>({
  text: 'Hello CTY CMS UI'
});
// watch, watchEffect 两个都为监听器
// watchEffect：立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行。文档：https://cn.vuejs.org/api/reactivity-core.html#watcheffect
const count = ref<number>(0);
watchEffect(() => console.log(count.value));
count.value++;
// watch：侦听一个或多个响应式数据源，并在数据源变化时调用所给的回调函数。文档：https://cn.vuejs.org/api/reactivity-core.html#watch
// 侦听一个 getter 函数
watch(
  () => reactiveEx.text,
  (text, prevText) => {
    console.log(text, prevText);
  }
);
// 侦听一个 ref
watch(
  () => count,
  (count, prevCount) => {
    console.log(count, prevCount);
  }
);
// 侦听多个来源时，回调函数接受两个数组，分别对应来源数组中的新值和旧值
watch([refEx, count], ([refEx, count], [prevRefEx, prevCount]) => {
  /* ... */
});

// computed 文档：https://cn.vuejs.org/api/reactivity-core.html#computed
/*
 * 接受一个 getter 函数，返回一个只读的响应式 ref 对象。
 * 该 ref 通过 .value 暴露 getter 函数的返回值。
 * 它也可以接受一个带有 get 和 set 函数的对象来创建一个可写的 ref 对象。
 */
// 创建一个只读的计算属性 ref
const countEx = ref(1);
const plusOne = computed(() => countEx.value + 1);
// plusOne.value++  会报错
console.log(plusOne.value); // 2

// 创建一个可写的计算属性 ref
const countTwo = ref(1);
const plusTwo = computed({
  get: () => countTwo.value + 2,
  set: val => {
    countTwo.value = val;
  }
});
plusTwo.value = 2;
console.log(countTwo.value); // 2
console.log(plusTwo.value); // 4
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
