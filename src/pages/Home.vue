<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>{{ greeting }}</h1>
      <p>欢迎使用本系统，祝您工作愉快。</p>
    </div>
    <div class="main-content">
      <div class="clock-section">
        <div class="clock">
          <div class="clock-time">{{ time }}</div>
          <div class="clock-date">{{ date }}</div>
        </div>
      </div>
      <el-row :gutter="24" class="info-section">
        <el-col :xs="24" :sm="24" :md="12">
          <el-card class="info-card notice-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="title">
                  <el-icon><Bell /></el-icon>
                  系统公告
                </span>
              </div>
            </template>
            <div class="info-content">本系统仅供学习与演示使用，更多功能敬请期待！</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <el-card class="info-card contact-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="title">
                  <el-icon><User /></el-icon>
                  联系方式
                </span>
              </div>
            </template>
            <div class="contact-list">
              <a href="https://github.com/Leon-Amazing" target="_blank" class="contact-item">
                <el-icon><Platform /></el-icon>
                <span>GitHub</span>
              </a>
              <div class="contact-item">
                <el-icon><Location /></el-icon>
                <span>城市：深圳</span>
              </div>
              <a href="https://leon-amazing.github.io/blog/" target="_blank" class="contact-item">
                <el-icon><Collection /></el-icon>
                <span>Blog：https://leon-amazing.github.io/blog/</span>
              </a>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Platform, Location, Collection, Bell, User } from '@element-plus/icons-vue';

const greeting = ref('');
const time = ref('');
const date = ref('');

function updateGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) {
    greeting.value = '凌晨好';
  } else if (hour < 12) {
    greeting.value = '上午好';
  } else if (hour < 18) {
    greeting.value = '下午好';
  } else {
    greeting.value = '晚上好';
  }
}

function updateClock() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  time.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  date.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

let timer: number;
onMounted(() => {
  updateGreeting();
  updateClock();
  timer = window.setInterval(() => {
    updateGreeting();
    updateClock();
  }, 1000);
});
onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.home-container {
  min-height: calc(100vh - 110px);
  padding: 40px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);

  .welcome-section {
    text-align: center;
    margin-bottom: 40px;
    h1 {
      font-size: 2.5rem;
      font-weight: bold;
      color: #0f172a;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }
    p {
      color: #475569;
      font-size: 1.2rem;
    }
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .clock-section {
    margin-bottom: 40px;
    display: flex;
    justify-content: center;

    .clock {
      background: #ffffff;
      border-radius: 16px;
      padding: 32px 48px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      text-align: center;
      min-width: 300px;

      .clock-time {
        font-size: 3rem;
        font-weight: bold;
        color: #1e40af;
        letter-spacing: 2px;
        font-family: 'Monaco', monospace;
      }

      .clock-date {
        margin-top: 8px;
        font-size: 1.2rem;
        color: #64748b;
      }
    }
  }

  .info-section {
    .info-card {
      height: 100%;
      border-radius: 12px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        padding: 16px 20px;

        .title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e40af;

          .el-icon {
            font-size: 1.2rem;
          }
        }
      }
    }

    .notice-card {
      .info-content {
        padding: 20px;
        color: #475569;
        font-size: 1rem;
        line-height: 1.6;
      }
    }

    .contact-card {
      .contact-list {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #475569;
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 8px 12px;
          border-radius: 8px;

          &:hover {
            background-color: #f1f5f9;
            color: #1e40af;
          }

          .el-icon {
            font-size: 1.2rem;
          }

          span {
            font-size: 1rem;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 20px;

    .welcome-section {
      h1 {
        font-size: 2rem;
      }
      p {
        font-size: 1rem;
      }
    }

    .clock-section {
      .clock {
        padding: 24px;
        min-width: auto;
        width: 90%;

        .clock-time {
          font-size: 2.5rem;
        }
      }
    }
  }
}
</style>
