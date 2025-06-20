<template>
  <div class="personal-center">
    <el-row :gutter="24">
      <!-- 左侧个人信息卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="6">
        <el-card class="profile-card" shadow="hover">
          <div class="profile-header">
            <el-avatar :size="120" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" @error="() => true">
              <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </el-avatar>
            <h2 class="profile-name">{{ userInfo.name }}</h2>
            <div class="profile-role">{{ userInfo.role }}</div>
          </div>
          <div class="profile-quote">
            <el-divider>
              <el-icon><star-filled /></el-icon>
            </el-divider>
            <p>{{ userInfo.quote }}</p>
            <p class="quote-author">—— {{ userInfo.quoteAuthor }}</p>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <h3>{{ userInfo.joinDays }}</h3>
              <p>已加入天数</p>
            </div>
            <div class="stat-item">
              <h3>{{ userInfo.projects }}</h3>
              <p>参与项目</p>
            </div>
            <div class="stat-item">
              <h3>{{ userInfo.contributions }}</h3>
              <p>贡献数</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧详细信息 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="18">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>个人资料</span>
              <el-button type="primary" text>编辑</el-button>
            </div>
          </template>
          <el-form :model="userInfo" label-width="100px" class="info-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名">
                  <el-input v-model="userInfo.username" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="真实姓名">
                  <el-input v-model="userInfo.name" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="userInfo.phone" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电子邮箱">
                  <el-input v-model="userInfo.email" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="个人简介">
                  <el-input type="textarea" v-model="userInfo.bio" disabled :rows="4" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <!-- 最近动态卡片 -->
        <el-card class="activity-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近动态</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item v-for="(activity, index) in userInfo.recentActivities" :key="index" :timestamp="activity.time" :type="activity.type">
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { StarFilled } from '@element-plus/icons-vue';

const userInfo: any = reactive({
  username: 'admin',
  name: '管理员',
  role: '系统管理员',
  quote: '人生如逆旅，我亦是行人',
  quoteAuthor: '苏轼',
  phone: '13800138000',
  email: 'admin@example.com',
  bio: '热爱技术，专注开发，让编程改变世界。',
  joinDays: 128,
  projects: 12,
  contributions: 326,
  recentActivities: [
    {
      content: '更新了系统配置',
      time: '2024-01-20 10:30:00',
      type: 'success',
    },
    {
      content: '审核了用户申请',
      time: '2024-01-19 14:20:00',
      type: 'info',
    },
    {
      content: '发布了新公告',
      time: '2024-01-18 16:45:00',
      type: 'primary',
    },
  ],
});
</script>

<style lang="scss" scoped>
.personal-center {
  padding: 20px;
  background-color: #f6f8f9;
  min-height: calc(100vh - 150px);

  .profile-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .profile-header {
      text-align: center;
      padding: 20px 0;

      .el-avatar {
        margin-bottom: 15px;
        border: 4px solid rgba(37, 99, 235, 0.1);
      }

      .profile-name {
        margin: 10px 0 5px;
        font-size: 1.5rem;
        color: #2c3e50;
      }

      .profile-role {
        color: #64748b;
        font-size: 0.9rem;
      }
    }

    .profile-quote {
      padding: 20px;
      text-align: center;
      color: #64748b;
      font-style: italic;

      .el-divider {
        margin: 15px 0;
        .el-icon {
          color: #2563eb;
        }
      }

      p {
        margin: 10px 0;
        line-height: 1.6;
      }

      .quote-author {
        color: #94a3b8;
        font-size: 0.9rem;
      }
    }

    .profile-stats {
      display: flex;
      justify-content: space-around;
      padding: 20px 0;
      text-align: center;
      border-top: 1px solid #e2e8f0;

      .stat-item {
        h3 {
          color: #2563eb;
          font-size: 1.5rem;
          margin-bottom: 5px;
        }
        p {
          color: #64748b;
          font-size: 0.9rem;
        }
      }
    }
  }

  .info-card,
  .activity-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 1.1rem;
        font-weight: 500;
        color: #2c3e50;
      }
    }
  }

  .info-form {
    padding: 20px 0;

    :deep(.el-input.is-disabled .el-input__inner) {
      color: #2c3e50;
      -webkit-text-fill-color: #2c3e50;
    }
  }

  .activity-card {
    .el-timeline {
      padding: 20px;
    }
  }
}
</style>
