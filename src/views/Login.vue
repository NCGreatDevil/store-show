<template>
  <!-- 登录页面 -->
  <van-nav-bar title="登录" />
  
  <!-- 登录表单 -->
  <van-form @submit="onLogin" style="padding: 16px">
    <!-- 邮箱输入框 -->
    <van-field
      v-model="email"
      name="email"
      label="邮箱"
      placeholder="请输入邮箱"
      :rules="[{ required: true, message: '请输入邮箱' }]"
    />
    
    <!-- 密码输入框 -->
    <van-field
      v-model="password"
      type="password"
      name="password"
      label="密码"
      placeholder="请输入密码"
      :rules="[{ required: true, message: '请输入密码' }]"
    />
    
    <!-- 登录按钮 -->
    <div style="margin: 16px">
      <van-button round block type="primary" native-type="submit">
        登录
      </van-button>
    </div>
    
    <!-- 跳转注册链接 -->
    <div style="text-align: center">
      <router-link :to="{ name: ROUTE_NAMES.REGISTER }">
        没有账号？去注册
      </router-link>
    </div>
  </van-form>
</template>

<script setup lang="ts">
/**
 * 登录页面组件
 * 
 * 功能：
 * 1. 用户输入邮箱和密码进行登录
 * 2. 登录成功后保存认证信息到 PocketBase
 * 3. 跳转到首页（用户信息管理页）
 * 
 * 认证流程：
 * 1. 用户提交表单
 * 2. 调用 PocketBase 的 authWithPassword 方法
 * 3. PocketBase 返回认证 token 和用户信息
 * 4. 自动保存到 pb.authStore 中
 * 5. 路由守卫检查认证状态
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import pb from '../api/pocketbase'
import { ROUTE_NAMES } from '../router'
import type { PocketBaseError } from '../types'

// ==================== 路由 ====================

// 获取路由实例，用于页面跳转
const router = useRouter()

// ==================== 表单数据 ====================

// 邮箱输入
const email = ref('')

// 密码输入
const password = ref('')

// ==================== 登录处理 ====================

/**
 * 登录事件处理
 * 表单提交时触发
 */
const onLogin = async (): Promise<void> => {
  try {
    // 调用 PocketBase 进行认证
    // authWithPassword 会自动将认证信息保存到 pb.authStore
    await pb.collection('users').authWithPassword(
      email.value,
      password.value
    )
    
    // 显示成功提示
    showToast('登录成功')
    
    // 跳转到首页（使用路由名称常量）
    router.push({ name: ROUTE_NAMES.HOME })
  } catch (error) {
    // 处理 PocketBase 错误
    const err = error as PocketBaseError
    
    // 显示错误提示
    showToast(err.message || '登录失败')
  }
}
</script>