<template>
  <!-- 注册页面 -->
  <van-nav-bar title="注册" />
  
  <!-- 注册表单 -->
  <van-form @submit="onRegister" style="padding: 16px">
    <!-- 邮箱输入框 -->
    <van-field
      v-model="email"
      name="email"
      label="邮箱"
      placeholder="请输入邮箱"
      :rules="[
        { required: true, message: '请输入邮箱' },
        { pattern: emailPattern, message: '请输入正确的邮箱格式' }
      ]"
    />
    
    <!-- 密码输入框 -->
    <van-field
      v-model="password"
      type="password"
      name="password"
      label="密码"
      placeholder="请输入密码（至少8位）"
      :rules="[
        { required: true, message: '请输入密码' },
        { pattern: passwordPattern, message: '密码至少8位，包含字母和数字' }
      ]"
    />
    
    <!-- 确认密码输入框 -->
    <van-field
      v-model="confirmPassword"
      type="password"
      name="confirmPassword"
      label="确认密码"
      placeholder="请再次输入密码"
      :rules="[
        { required: true, message: '请确认密码' },
        { validator: validatePasswordMatch, message: '两次密码不一致' }
      ]"
    />
    
    <!-- 注册按钮 -->
    <div style="margin: 16px">
      <van-button round block type="primary" native-type="submit">
        注册
      </van-button>
    </div>
    
    <!-- 跳转登录链接 -->
    <div style="text-align: center">
      <router-link :to="{ name: ROUTE_NAMES.LOGIN }">
        已有账号？去登录
      </router-link>
    </div>
  </van-form>
</template>

<script setup lang="ts">
/**
 * 注册页面组件
 * 
 * 功能：
 * 1. 用户输入邮箱和密码进行注册
 * 2. 表单验证：邮箱格式、密码强度、密码一致性
 * 3. 注册成功后跳转到登录页
 * 
 * 表单验证规则：
 * - 邮箱：必填，符合邮箱格式
 * - 密码：必填，至少8位，包含字母和数字
 * - 确认密码：必填，与密码一致
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

// 确认密码输入
const confirmPassword = ref('')

// ==================== 验证规则 ====================

/**
 * 邮箱格式正则表达式
 * 匹配标准邮箱格式：用户名@域名.后缀
 */
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * 密码强度正则表达式
 * 要求：至少8位，包含字母和数字
 */
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/

/**
 * 验证两次密码是否一致
 * 
 * @param val - 确认密码的值
 * @returns true: 一致, false: 不一致
 */
const validatePasswordMatch = (val: string): boolean => {
  return val === password.value
}

// ==================== 注册处理 ====================

/**
 * 注册事件处理
 * 表单提交时触发
 */
const onRegister = async (): Promise<void> => {
  try {
    // 调用 PocketBase 创建用户
    // PocketBase 要求提供 email、password、passwordConfirm
    await pb.collection('users').create({
      email: email.value,
      password: password.value,
      passwordConfirm: confirmPassword.value
    })
    
    // 显示成功提示
    showToast('注册成功，请登录')
    
    // 跳转到登录页（使用路由名称常量）
    router.push({ name: ROUTE_NAMES.LOGIN })
  } catch (error) {
    // 处理 PocketBase 错误
    const err = error as PocketBaseError
    
    // 显示错误提示
    showToast(err.message || '注册失败')
  }
}
</script>