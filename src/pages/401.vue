<template>
  <div class="error-container">
    <div class="error-content">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="pic-error">
            <img alt="401" class="pic-error-parent" src="@/assets/error/401.png" />
            <img alt="401" class="pic-error-child left" src="@/assets/error/cloud.png" />
            <img alt="401" class="pic-error-child" src="@/assets/error/cloud.png" />
            <img alt="401" class="pic-error-child" src="@/assets/error/cloud.png" />
          </div>
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="bullshit">
            <div class="bullshit-oops">{{ oops }}</div>
            <div class="bullshit-headline">{{ headline }}</div>
            <div class="bullshit-info">{{ info }}</div>
            <router-link class="bullshit-return-home" to="/"> {{ jumpTime }}s&nbsp;{{ btn }} </router-link>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const jumpTime = ref<number>(5);
const oops = ref<string>('抱歉！');
const headline = ref<string>('您没有操作权限...');
const info = ref<string>('当前帐号没有操作权限,请联系管理员。');
const btn = ref<string>('返回');
const timer = ref<null | number>(null);

const timeChange = () => {
  timer.value = window.setInterval(() => {
    if (jumpTime.value) {
      jumpTime.value--;
    } else {
      router.push({ path: '/' });
      clearInterval(Number(timer.value));
    }
  }, 1000);
};

onMounted(() => {
  timeChange();
});

onBeforeUnmount(() => {
  clearInterval(Number(timer.value));
});
</script>

<style lang="scss" scoped>
.error-container {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  .error-content {
    .pic-error {
      position: relative;
      float: left;
      width: 120%;
      overflow: hidden;
      &-parent {
        width: 100%;
      }
      &-child {
        position: absolute;
        &.left {
          top: 17px;
          left: 220px;
          width: 80px;
          opacity: 0;
          animation-name: cloudLeft;
          animation-duration: 2s;
          animation-timing-function: linear;
          animation-delay: 1s;
          animation-fill-mode: forwards;
        }
        &.mid {
          top: 10px;
          left: 420px;
          width: 46px;
          opacity: 0;
          animation-name: cloudMid;
          animation-duration: 2s;
          animation-timing-function: linear;
          animation-delay: 1.2s;
          animation-fill-mode: forwards;
        }
        &.right {
          top: 100px;
          left: 500px;
          width: 62px;
          opacity: 0;
          animation-name: cloudRight;
          animation-duration: 2s;
          animation-timing-function: linear;
          animation-delay: 1s;
          animation-fill-mode: forwards;
        }
        @keyframes cloudLeft {
          0% {
            top: 17px;
            left: 220px;
            opacity: 0;
          }
          20% {
            top: 33px;
            left: 188px;
            opacity: 1;
          }
          80% {
            top: 81px;
            left: 92px;
            opacity: 1;
          }
          100% {
            top: 97px;
            left: 60px;
            opacity: 0;
          }
        }
        @keyframes cloudMid {
          0% {
            top: 10px;
            left: 420px;
            opacity: 0;
          }
          20% {
            top: 40px;
            left: 360px;
            opacity: 1;
          }
          70% {
            top: 130px;
            left: 180px;
            opacity: 1;
          }
          100% {
            top: 160px;
            left: 120px;
            opacity: 0;
          }
        }
        @keyframes cloudRight {
          0% {
            top: 100px;
            left: 500px;
            opacity: 0;
          }
          20% {
            top: 120px;
            left: 460px;
            opacity: 1;
          }
          80% {
            top: 180px;
            left: 340px;
            opacity: 1;
          }
          100% {
            top: 200px;
            left: 300px;
            opacity: 0;
          }
        }
      }
    }
    .bullshit {
      position: relative;
      float: left;
      width: 300px;
      padding: 30px 0;
      overflow: hidden;
      &-oops {
        margin-bottom: 20px;
        font-size: 32px;
        font-weight: bold;
        line-height: 40px;
        color: var(--base-color-default);
        opacity: 0;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-fill-mode: forwards;
      }
      &-headline {
        margin-bottom: 10px;
        font-size: 20px;
        font-weight: bold;
        line-height: 24px;
        color: #222;
        opacity: 0;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.1s;
        animation-fill-mode: forwards;
      }
      &-info {
        margin-bottom: 30px;
        font-size: 13px;
        line-height: 21px;
        color: var(--base-color-gray);
        opacity: 0;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.2s;
        animation-fill-mode: forwards;
      }
      &-return-home {
        display: block;
        float: left;
        width: 110px;
        height: 36px;
        font-size: 14px;
        line-height: 36px;
        color: #fff;
        text-align: center;
        cursor: pointer;
        background: var(--base-color-default);
        border-radius: 100px;
        opacity: 0;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.3s;
        animation-fill-mode: forwards;
      }
      @keyframes slideUp {
        0% {
          opacity: 0;
          transform: translateY(60px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  }
}
</style>
