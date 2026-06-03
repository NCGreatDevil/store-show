<template>
  <!-- 404 页面：当访问不存在的路由时显示 -->
  <div class="not-found">
    <van-empty
      image="error"
      description="页面不存在"
    >
      <!-- 自定义底部按钮 -->
      <template #footer>
        <van-button 
          round 
          type="primary" 
          @click="goHome"
        >
          返回首页
        </van-button>
      </template>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

// 获取路由实例
const router = useRouter()

/**
 * 返回首页
 * 如果用户已登录则跳转到首页，否则跳转到登录页
 */
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* 404 页面样式 */
.not-found {
  /* 垂直居中显示 */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* 移除默认边距 */
  padding: 0;
}
</style>