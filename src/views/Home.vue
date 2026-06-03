<template>
  <!-- 首页：用户信息管理 -->
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar title="用户信息管理">
      <!-- 右侧退出按钮 -->
      <template #right>
        <van-button 
          size="small" 
          type="danger" 
          plain 
          @click="onLogout"
        >
          退出
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 下拉刷新组件 -->
    <van-pull-refresh 
      v-model="refreshing" 
      @refresh="onRefresh"
    >
      <!-- 无限滚动列表组件 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <!-- 每个用户信息项（支持滑动删除） -->
        <van-swipe-cell 
          v-for="item in list" 
          :key="item.id"
        >
          <!-- 用户信息单元格 -->
          <van-cell
            :title="item.username"
            :label="formatLabel(item)"
            is-link
            @click="onEdit(item)"
          />
          <!-- 右侧删除按钮 -->
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

    <!-- 空状态提示 -->
    <van-empty 
      v-if="!loading && list.length === 0" 
      description="暂无数据" 
    />

    <!-- 底部新增按钮 -->
    <div style="padding: 16px; text-align: center">
      <van-button 
        round 
        block 
        type="primary" 
        @click="showAddForm"
      >
        新增用户信息
      </van-button>
    </div>

    <!-- 新增/编辑对话框 -->
    <van-dialog
      v-model:show="showDialog"
      :title="isEditing ? '编辑用户信息' : '新增用户信息'"
      show-cancel-button
      @confirm="onSave"
      @cancel="resetForm"
    >
      <!-- 表单内容 -->
      <van-form style="padding: 16px">
        <!-- 用户名输入框 -->
        <van-field
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <!-- 年龄输入框 -->
        <van-field
          v-model="form.age"
          label="年龄"
          placeholder="请输入年龄"
          type="digit"
        />
        <!-- 职业输入框 -->
        <van-field
          v-model="form.occupation"
          label="职业"
          placeholder="请输入职业"
        />
        <!-- 电话输入框 -->
        <van-field
          v-model="form.phone"
          label="电话"
          placeholder="请输入电话"
          type="tel"
        />
        <!-- 自我介绍输入框 -->
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
/**
 * 首页组件
 * 
 * 功能：
 * 1. 显示用户信息列表
 * 2. 支持新增、编辑、删除用户信息
 * 3. 支持下拉刷新和无限滚动加载
 * 4. 用户退出登录
 * 
 * 使用 Composable（组合式函数）：
 * - useUserProfile：封装用户信息的 CRUD 操作
 * 
 * 优点：
 * - 逻辑复用：composable 可以在其他组件中使用
 * - 代码清晰：将业务逻辑与 UI 分离
 * - 易于维护：修改逻辑只需更新 composable
 */

import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserProfile } from '../composables/useUserProfile'
import { ROUTE_NAMES } from '../router'
import pb from '../api/pocketbase'
import type { UserProfile } from '../types'

// ==================== 路由 ====================

// 获取路由实例，用于页面跳转
const router = useRouter()

// ==================== 用户信息管理 ====================

// 使用 composable 获取用户信息相关的状态和方法
const {
  // 状态
  list,           // 用户信息列表
  loading,        // 加载状态
  finished,       // 加载完成状态
  refreshing,     // 刷新状态
  showDialog,     // 对话框显示状态
  isEditing,      // 编辑模式标志
  form,           // 表单数据
  
  // 方法
  loadList,       // 加载列表
  refreshList,    // 刷新列表
  showAddForm,    // 显示新增表单
  showEditForm,   // 显示编辑表单
  saveForm,       // 保存表单
  deleteUserProfile,  // 删除用户信息
  resetForm       // 重置表单
} = useUserProfile()

// ==================== UI 辅助方法 ====================

/**
 * 格式化用户信息标签
 * 将多个字段组合成一行显示
 * 
 * @param item - 用户信息对象
 * @returns 格式化后的标签文本
 */
const formatLabel = (item: UserProfile): string => {
  const parts: string[] = []
  
  // 添加年龄
  if (item.age) {
    parts.push(`年龄: ${item.age}`)
  }
  
  // 添加职业
  if (item.occupation) {
    parts.push(item.occupation)
  }
  
  // 添加电话
  if (item.phone) {
    parts.push(item.phone)
  }
  
  // 如果没有信息，显示默认文本
  if (parts.length === 0) {
    parts.push('暂无信息')
  }
  
  // 用分隔符连接各部分
  return parts.join(' | ')
}

// ==================== 事件处理方法 ====================

/**
 * 加载事件处理
 * 由 van-list 组件触发
 */
const onLoad = (): void => {
  loadList()
}

/**
 * 刷新事件处理
 * 由 van-pull-refresh 组件触发
 */
const onRefresh = (): void => {
  refreshList()
}

/**
 * 编辑事件处理
 * 点击用户信息项时触发
 * 
 * @param item - 要编辑的用户信息
 */
const onEdit = (item: UserProfile): void => {
  showEditForm(item)
}

/**
 * 保存事件处理
 * 点击对话框确认按钮时触发
 */
const onSave = async (): Promise<void> => {
  try {
    // 调用 composable 的保存方法
    await saveForm()
    
    // 显示成功提示
    showToast(isEditing.value ? '更新成功' : '创建成功')
  } catch (error) {
    // 显示错误提示
    const err = error as Error
    showToast(err.message)
  }
}

/**
 * 删除事件处理
 * 点击删除按钮时触发
 * 
 * @param item - 要删除的用户信息
 */
const onDelete = async (item: UserProfile): Promise<void> => {
  try {
    // 显示确认对话框
    await showConfirmDialog({
      message: `确定删除 ${item.username} 的信息吗？`
    })
    
    // 用户确认后执行删除
    await deleteUserProfile(item.id)
    
    // 显示成功提示
    showToast('删除成功')
    
    // 刷新列表
    refreshList()
  } catch (error) {
    // 用户取消删除时不显示错误
    if (error !== 'cancel') {
      const err = error as Error
      showToast(err.message)
    }
  }
}

/**
 * 退出登录事件处理
 * 清除认证信息并跳转到登录页
 */
const onLogout = (): void => {
  // 清除 PocketBase 的认证信息
  pb.authStore.clear()
  
  // 跳转到登录页（使用路由名称常量）
  router.push({ name: ROUTE_NAMES.LOGIN })
}
</script>