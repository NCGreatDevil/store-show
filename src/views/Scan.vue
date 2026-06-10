<template>
  <!-- 扫描商品页 -->
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar 
      title="扫描商品"
      fixed
      placeholder
      border
      z-index="100"
    ></van-nav-bar>

    <van-sticky :offset-top="48" class="main">
      <van-row class="m-2">
        <van-col span="24" class="text-center relative">
          <div id="scan-container" class="w-full aspect-video bg-gray-900" @click="toggleScan"></div>
          <div 
            v-if="!isScanning" 
            class="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-lg font-bold cursor-pointer"
            @click="toggleScan"
          >
            点击开启摄像头
          </div>
        </van-col>
      </van-row>
    </van-sticky>   

    <van-cell-group class="mx-2 my-4 pt-4 pb-[50px]">
      <van-cell 
        v-for="item in receipt.items" 
        :key="item.productId"
      >
        <template #title>
          <span class="ml-2">{{ item.productName }}</span>
        </template>
        <template #label>
          <span class="ml-2">¥{{ item.productPrice.toFixed(2) }}/{{ item.unit }}</span>
        </template>
        <template #icon>
          <van-image width="52" height="52" :src="item.productImage" fit="cover" />
        </template>
        <template #right-icon>
          <van-stepper 
            v-model="item.quantity" 
            :min="1" 
            :max="99" 
            class="ml-2" 
            @change="(value) => onQuantityChange(item.productId, value)" 
          />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 下拉刷新组件 -->
    <van-pull-refresh 
      v-model="refreshing" 
      @refresh="onRefresh"
      class="mt-4 pb-[50px]"
    >
      <!-- 无限滚动列表组件 --><!--原先是这样： finished-text="没有更多了"  -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="" 
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
    <!-- <div style="padding: 16px; text-align: center">
      <van-button 
        round 
        block 
        type="primary" 
        @click="showAddForm"
      >
        新增用户信息
      </van-button>
    </div> -->

    <!-- 新增/编辑对话框 -->
    <!-- <van-dialog
      v-model:show="showDialog"
      :title="isEditing ? '编辑用户信息' : '新增用户信息'"
      show-cancel-button
      @confirm="onSave"
      @cancel="resetForm"
    >
      
      <van-form style="padding: 16px">
        <van-field
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
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
    </van-dialog> -->

    <van-submit-bar
      :price="totalPrice"
      button-text="提交订单"
      @submit="onSubmit"
      class="bottom-[50px]!"
    >
      <template #default>
        <span class="van-submit-bar__text">
          <!-- 合计: 
          <span class="van-submit-bar__price">¥{{ (totalPrice / 100).toFixed(2) }}</span> -->
          数量: 
          <span class="van-submit-bar__price van-submit-bar__price-integer">{{ quantity }}</span>
        </span>
      </template>
    </van-submit-bar>
  </div>
</template>

<script setup lang="ts">
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { onMounted, onUnmounted, ref, computed } from 'vue'
import type { Receipt } from '../types'

let html5QrCode: Html5Qrcode | null = null; 
const isScanning = ref(false);
const receipt = ref<Receipt>({
  id: 'mock-receipt-001',
  items: [
    {
      productId: 'p1',
      productName: '薯片',
      productPrice: 8.5,
      productImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU4IiBmb250LWZhbWlseT0iUGluZ0ZhbmcgU0MsTWljcm9zb2Z0IFlhSGVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuiWr+eJhzwvdGV4dD48L3N2Zz4=',
      quantity: 2,
      unit: '包',
    },
    {
      productId: 'p2',
      productName: '可乐',
      productPrice: 3.0,
      productImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU4IiBmb250LWZhbWlseT0iUGluZ0ZhbmcgU0MsTWljcm9zb2Z0IFlhSGVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWPr+S5kDwvdGV4dD48L3N2Zz4=',
      quantity: 3,
      unit: '瓶',
    },
    {
      productId: 'p3',
      productName: '辣条',
      productPrice: 2.5,
      productImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU4IiBmb250LWZhbWlseT0iUGluZ0ZhbmcgU0MsTWljcm9zb2Z0IFlhSGVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPui+o+adoTwvdGV4dD48L3N2Zz4=',
      quantity: 5,
      unit: '包',
    },
  ],
});

// 根据账单商品动态计算总价（单位：分）
const totalPrice = computed(() => {
  return Math.round(
    receipt.value.items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0) * 100
  );
});

// 根据账单商品动态计算总数量
const quantity = computed(() => {
  return receipt.value.items.reduce((sum, item) => sum + item.quantity, 0);
});

/**
 * 商品数量变化时触发
 */
const onQuantityChange = (productId: string, value: number): void => {
  const item = receipt.value.items.find((i) => i.productId === productId);
  if (item) {
    item.quantity = value as number;
  }
};

const INACTIVITY_TIMEOUT = 30000; // 30s
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

const resetInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  if (isScanning.value) {
    inactivityTimer = window.setTimeout(async () => {
      showToast('摄像头因长时间没有录入，自动关闭');
      // 复用 toggleScan 的暂停逻辑
      if (html5QrCode && isScanning.value) {
        await html5QrCode.stop();
        html5QrCode.clear();
        isScanning.value = false;
      }
    }, INACTIVITY_TIMEOUT);
  }
};

const startScanner = async () => {
  html5QrCode = new Html5Qrcode('scan-container');
  await html5QrCode.start(
    { facingMode: 'environment' },
    {
      fps: 10,
      qrbox: { width: 320, height: 230 }
    },
    async (decodedText) => {
      console.log('扫描结果:', decodedText);
      
      // 重置不活动计时器
      resetInactivityTimer();
      
      // 暂停扫描
      await html5QrCode!.pause();
      
      // 替换库自带的暂停提示文字
      const pausedTextEl = document.querySelector('#scan-container > div:nth-child(4)');
      if (pausedTextEl) {
        pausedTextEl.textContent = '正在识别';
      }
      
      try {
        // TODO: 这里添加商品查询和加入账单的逻辑
        showToast('商品已加入账单');
      } catch {
        showToast('该编码商品未能识别');
      }
      
      // 1秒后恢复扫描
      setTimeout(async () => {
        await html5QrCode!.resume();
      }, 1000);
    },
    (errorMessage) => {
      // 扫描失败时的回调
    }    
  );
  isScanning.value = true;
  
  // 启动不活动计时器
  resetInactivityTimer();
};

const toggleScan = async () => {
  try {
    if (isScanning.value && html5QrCode) {
      await html5QrCode.stop();
      html5QrCode.clear();
      isScanning.value = false;
      // 清除不活动计时器
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }
    } else {
      await startScanner();
    }
  } catch (error) {
    console.error('切换失败:', error);
    // showToast('操作失败，请重试');
  }
};

/**
 * 提交订单事件处理
 */
const onSubmit = (): void => {
  showToast('提交订单')
}

onMounted(async () => {
  await startScanner();
});
onUnmounted(async () => {
  // 清除不活动计时器
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  if (html5QrCode && html5QrCode.isScanning) {
    await html5QrCode.stop()
  }
  if (html5QrCode) {
    html5QrCode.clear()
  }
})

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

<style scoped>
#scan-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  position: relative;
}

#scan-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}
</style>