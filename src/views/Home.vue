<template>
  <div>
    <van-nav-bar title="用户信息管理">
      <template #right>
        <van-button size="small" type="danger" plain @click="onLogout">退出</van-button>
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-swipe-cell v-for="item in list" :key="item.id">
          <van-cell
            :title="item.username"
            :label="formatLabel(item)"
            is-link
            @click="onEdit(item)"
          />
          <template #right>
            <van-button
              square
              type="danger"
              text="删除"
              style="height: 100%"
              @click="onDelete(item)"
            />
          </template>
        </van-swipe-cell>
      </van-list>
    </van-pull-refresh>

    <van-empty v-if="!loading && list.length === 0" description="暂无数据" />

    <div style="padding: 16px; text-align: center">
      <van-button round block type="primary" @click="showDialog = true">
        新增用户信息
      </van-button>
    </div>

    <!-- 新增/编辑对话框 -->
    <van-dialog
      v-model:show="showDialog"
      :title="isEditing ? '编辑用户信息' : '新增用户信息'"
      show-cancel-button
      @confirm="onSave"
    >
      <van-form style="padding: 16px">
        <van-field
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名"
        />
        <van-field
          v-model="form.age"
          label="年龄"
          placeholder="请输入年龄"
          type="digit"
        />
        <van-field
          v-model="form.occupation"
          label="职业"
          placeholder="请输入职业"
        />
        <van-field
          v-model="form.phone"
          label="电话"
          placeholder="请输入电话"
          type="tel"
        />
        <van-field
          v-model="form.bio"
          label="自我介绍"
          placeholder="请输入自我介绍"
          type="textarea"
          rows="3"
          autosize
        />
      </van-form>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import pb from '../api/pocketbase'
import type { UserProfile, UserProfileForm } from '../types'

const router = useRouter()

const list = ref<UserProfile[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const showDialog = ref(false)
const isEditing = ref(false)
const editingId = ref('')
let loadingLock = false

const defaultForm: UserProfileForm = {
  username: '',
  age: undefined,
  occupation: '',
  phone: '',
  bio: ''
}

const form = reactive<UserProfileForm>({ ...defaultForm })

const authHeaders = (): Record<string, string> => {
  const token = pb.authStore.token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const apiFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `请求失败: ${res.status}`)
  }
  return res.json()
}

const formatLabel = (item: UserProfile) => {
  const parts: string[] = []
  if (item.age) parts.push(`年龄: ${item.age}`)
  if (item.occupation) parts.push(item.occupation)
  if (item.phone) parts.push(item.phone)
  if (parts.length === 0) parts.push('暂无信息')
  return parts.join(' | ')
}

const onLoad = async () => {
  if (loadingLock || finished.value) return
  loadingLock = true
  try {
    const result = await apiFetch('/api/collections/user_profiles/records?page=1&perPage=500&sort=-created')
    list.value = result.items || []
    finished.value = true
  } catch (err: any) {
    showToast(err?.message || '加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
    loadingLock = false
  }
}

const onRefresh = () => {
  finished.value = false
  loading.value = true
  loadingLock = false
  onLoad()
}

const showAddForm = () => {
  isEditing.value = false
  editingId.value = ''
  Object.assign(form, defaultForm)
  showDialog.value = true
}

const onEdit = (item: UserProfile) => {
  isEditing.value = true
  editingId.value = item.id
  form.username = item.username
  form.age = item.age
  form.occupation = item.occupation || ''
  form.phone = item.phone || ''
  form.bio = item.bio || ''
  showDialog.value = true
}

const onSave = async () => {
  if (!form.username.trim()) {
    showToast('请输入用户名')
    return
  }
  try {
    const body = {
      ...form,
      user_id: pb.authStore.record?.id || ''
    }
    if (isEditing.value) {
      await apiFetch(`/api/collections/user_profiles/records/${editingId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      })
      showToast('更新成功')
    } else {
      await apiFetch('/api/collections/user_profiles/records', {
        method: 'POST',
        body: JSON.stringify(body)
      })
      showToast('创建成功')
    }
    showDialog.value = false
    onRefresh()
  } catch (err: any) {
    showToast(err?.message || '操作失败')
  }
}

const onDelete = async (item: UserProfile) => {
  try {
    await showConfirmDialog({ message: `确定删除 ${item.username} 的信息吗？` })
    await apiFetch(`/api/collections/user_profiles/records/${item.id}`, {
      method: 'DELETE'
    })
    showToast('删除成功')
    onRefresh()
  } catch (err: any) {
    if (err !== 'cancel') {
      showToast(err?.message || '删除失败')
    }
  }
}

const onLogout = () => {
  pb.authStore.clear()
  router.push('/login')
}
</script>
