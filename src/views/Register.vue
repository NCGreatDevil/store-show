<template>
  <van-nav-bar title="注册" />
  <van-form @submit="onRegister" style="padding: 16px">
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
      placeholder="请输入密码（至少8位）"
      :rules="[{ required: true, message: '请输入密码' }]"
    />
    <van-field
      v-model="confirmPassword"
      type="password"
      name="confirmPassword"
      label="确认密码"
      placeholder="请再次输入密码"
      :rules="[{ required: true, message: '请确认密码' }]"
    />
    <div style="margin: 16px">
      <van-button round block type="primary" native-type="submit">
        注册
      </van-button>
    </div>
    <div style="text-align: center">
      <router-link to="/login">已有账号？去登录</router-link>
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
const confirmPassword = ref('')

const onRegister = async () => {
  if (password.value !== confirmPassword.value) {
    showToast('两次密码不一致')
    return
  }
  try {
    await pb.collection('users').create({
      email: email.value,
      password: password.value,
      passwordConfirm: confirmPassword.value
    })
    showToast('注册成功，请登录')
    router.push('/login')
  } catch (err: any) {
    showToast(err?.message || '注册失败')
  }
}
</script>
