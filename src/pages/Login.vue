<template>
  <div class="login">
    <div class="login-input">
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form" :label-position="'top'">
        <div class="login-title">
          <p>项目实践</p>
        </div>
        <el-form-item label="账号" prop="username" size="large">
          <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="请输入账号">
            <template #prepend>
              <el-icon>
                <user />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" size="large">
          <el-input v-model="loginForm.password" show-password type="password" auto-complete="off" placeholder="请输入密码">
            <template #prepend>
              <el-icon>
                <lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code" size="large" class="login-code-wrap">
          <el-input v-model="loginForm.code" auto-complete="off" placeholder="请输入验证码" style="width: 60%" @keyup.enter="handleLogin">
            <template #prepend>
              <el-icon>
                <message />
              </el-icon>
            </template>
            <template #append>
              <div class="login-code">验证码</div>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item style="width: 100%">
          <el-button :loading="loading" style="width: 100%" class="login-button" @click.prevent="handleLogin">
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const useUser = useUserStore();
const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  code: '250620',
});

const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
  code: [{ required: true, trigger: 'blur', message: '请输入验证码' }],
};

const loading = ref<boolean>(false);

const codeUrl = ref<string>('');

const getCode = () => {
  codeUrl.value = `/base/home/VerificationCode?height=35&width=100&fontsize=20&rnd=${Math.random()}`;
};

const loginRef = ref();

const handleLogin = () => {
  loginRef.value.validate(async (vaild: boolean) => {
    if (vaild) {
      // 虚拟登录
      loading.value = true;
      useUser
        .login({ ...toRaw(loginForm) })
        .then(() => {
          router.push({
            path: '/',
          });
        })
        .catch(err => {
          loading.value = false;
          ElMessage.error(err);
        });
    }
  });
};
</script>

<style lang="scss" scoped>
/* 动态渐变背景动画 */
@keyframes gradient-move {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.login {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 动态渐变背景 */
  background: linear-gradient(-45deg, #1e3c72, #2a5298, #6dd5ed, #2193b0, #6e45e2, #88d3ce);
  background-size: 400% 400%;
  animation: gradient-move 12s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

/* 炫酷光斑特效 */
.login::before,
.login::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  z-index: 1;
}
.login::before {
  width: 400px;
  height: 400px;
  left: 10%;
  top: 10%;
  background: #ff6a00;
  animation: move1 10s infinite alternate;
}
.login::after {
  width: 300px;
  height: 300px;
  right: 10%;
  bottom: 10%;
  background: #00c3ff;
  animation: move2 12s infinite alternate;
}
@keyframes move1 {
  0% {
    left: 10%;
    top: 10%;
  }
  100% {
    left: 30%;
    top: 30%;
  }
}
@keyframes move2 {
  0% {
    right: 10%;
    bottom: 10%;
  }
  100% {
    right: 25%;
    bottom: 25%;
  }
}

/* 玻璃拟态登录框 */
.login-input {
  position: relative;
  z-index: 2;
  width: 420px;
  padding: 48px 36px 36px 36px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(16px);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.3s;
}

.login-title {
  width: 100%;
  text-align: center;
  margin-bottom: 32px;
  p {
    font-size: 2.2rem;
    font-weight: bold;
    background: linear-gradient(90deg, #6e45e2, #88d3ce, #ff6a00, #00c3ff);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 16px rgba(110, 69, 226, 0.2);
    letter-spacing: 2px;
    animation: shine 2.5s linear infinite;
  }
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

.login-form {
  width: 100%;
  .el-form-item {
    margin-bottom: 22px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .el-form-item__label {
    color: #fff;
    font-weight: 500;
    letter-spacing: 1px;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.12);
    margin-bottom: 6px;
    font-size: 1rem;
    line-height: 1.2;
  }
}

.el-input__wrapper {
  border-radius: 12px !important;
  background: linear-gradient(120deg, rgba(110, 69, 226, 0.1) 0%, rgba(0, 195, 255, 0.1) 100%), rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 12px 0 rgba(110, 69, 226, 0.1);
  border: none !important;
  min-height: 44px;
  display: flex;
  align-items: center;
  transition: box-shadow 0.25s, background 0.25s, border 0.25s;
  backdrop-filter: blur(4px);
}

.el-input__wrapper:focus-within {
  background: linear-gradient(120deg, rgba(110, 69, 226, 0.18) 0%, rgba(0, 195, 255, 0.18) 100%), rgba(255, 255, 255, 0.38) !important;
  border: 2px solid;
  border-image: linear-gradient(90deg, #6e45e2 0%, #00c3ff 100%);
  border-image-slice: 1;
  box-shadow: 0 2px 16px 0 rgba(110, 69, 226, 0.1);
  outline: none;
}

.el-input__inner {
  color: #23272e;
  font-size: 1.08rem;
  background: transparent !important;
  height: 44px;
  line-height: 44px;
  padding-left: 6px;
  &::placeholder {
    color: #b3b8c3;
    opacity: 1;
    font-size: 1rem;
    letter-spacing: 1px;
  }
}

.login-code-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  .el-input {
    flex: 1;
    min-width: 0;
  }
  .login-code {
    cursor: pointer;
  }
}

.el-icon {
  color: #6e45e2;
  font-size: 1.3rem;
  margin-right: 4px;
  vertical-align: middle;
}

.login-button {
  height: 46px;
  border-radius: 12px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  background: linear-gradient(90deg, #6e45e2, #00c3ff);
  box-shadow: 0 4px 16px 0 rgba(110, 69, 226, 0.18);
  border: none;
  transition: background 0.3s, box-shadow 0.3s;
  margin-top: 8px;
}
.login-button:hover {
  background: linear-gradient(90deg, #ff6a00, #6e45e2);
  box-shadow: 0 6px 24px 0 rgba(255, 106, 0, 0.18);
}
</style>
