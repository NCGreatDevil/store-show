<template>
  <van-nav-bar title="登录" />
  <van-form @submit="onLogin" style="padding: 16px">
    <van-field
      v-model="email"
      name="email"
      label="邮箱"
      placeholder="请输入邮箱"
      :rules="[{ required: true, message: '请输入邮箱' }]"
    />
    <van-field
      v-model="password"
      type="password"
      name="password"
      label="密码"
      placeholder="请输入密码"
      :rules="[{ required: true, message: '请输入密码' }]"
    />
    <div style="margin: 16px">
      <van-button round block type="primary" native-type="submit">
        登录
      </van-button>
    </div>
    <div style="text-align: center">
      <router-link to="/register">没有账号？去注册</router-link>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import pb from '../api/pocketbase'

const router = useRouter()
const email = ref('')
const password = ref('')

const onLogin = async () => {
  try {
    await pb.collection('users').authWithPassword(email.value, password.value)
    showToast('登录成功')
    router.push('/')
  } catch (err: any) {
    showToast(err?.message || '登录失败')
  }
}
</script>
