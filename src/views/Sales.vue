<template>
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar  
      title="销售记录"
      fixed
      placeholder
      border
      z-index="100"
    >
      <template #left>
        <van-icon name="arrow-left" @click="goBack" />
      </template>
    </van-nav-bar>

    <!-- 今日统计 -->
    <div class="mx-3 mt-3 bg-white rounded-xl p-4 flex justify-around">
      <div class="text-center bg-blue-50 rounded-xl px-6 py-3">
        <div class="text-xl font-bold text-gray-800">¥{{ todayTotal.toFixed(2) }}</div>
        <div class="text-sm text-gray-500 mt-1">销售额</div>
      </div>
      <div class="text-center bg-blue-50 rounded-xl px-6 py-3">
        <div class="text-xl font-bold text-gray-800">{{ todayCount }}</div>
        <div class="text-sm text-gray-500 mt-1">订单数</div>
      </div>
    </div>

    <!-- 筛选标签 -->
    <van-tabs v-model:active="activeTab" class="mt-3" sticky :offset-top="48">
      <van-tab title="今日" name="today" />
      <van-tab title="本周" name="week" />
      <van-tab title="本月" name="month" />
      <van-tab title="本年" name="year" />
      <van-tab title="全部" name="all" />
    </van-tabs>
    <div class="mx-3 border-b border-gray-200"></div>

    <!-- 销售记录列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="mx-3 mt-3 bg-white rounded-xl shadow-sm p-4 flex items-center justify-between"
        >
          <div>
            <div class="text-base font-medium text-gray-800">{{ item.datetime }}</div>
            <div class="text-sm text-gray-400 mt-1">{{ item.itemCount }}件商品</div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-gray-800">¥{{ item.totalAmount.toFixed(2) }}</div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty v-if="!loading && filteredList.length === 0" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 筛选标签，默认今日
const activeTab = ref('today')

// 列表状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 模拟销售记录数据
const mockSales = [
  {
    id: '1',
    datetime: '2026-06-08 21:10:00',
    totalAmount: 128.50,
    itemCount: 5,
  },
  {
    id: '2',
    datetime: '2026-06-08 15:30:00',
    totalAmount: 45.00,
    itemCount: 2,
  },
  {
    id: '3',
    datetime: '2026-06-07 10:40:00',
    totalAmount: 21.35,
    itemCount: 2,
  },
  {
    id: '4',
    datetime: '2026-06-05 02:22:00',
    totalAmount: 14.50,
    itemCount: 2,
  },
  {
    id: '5',
    datetime: '2026-06-01 18:30:00',
    totalAmount: 32.80,
    itemCount: 3,
  },
  {
    id: '6',
    datetime: '2026-05-22 09:15:00',
    totalAmount: 8.50,
    itemCount: 1,
  },
]

const list = ref(mockSales)

// 根据 tab 过滤列表并计算统计数据
const filteredList = computed(() => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(todayStart.getDate() - todayStart.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)

  return list.value.filter((item) => {
    const itemDate = new Date(item.datetime)
    switch (activeTab.value) {
      case 'today':
        return itemDate >= todayStart
      case 'week':
        return itemDate >= weekStart
      case 'month':
        return itemDate >= monthStart
      case 'year':
        return itemDate >= yearStart
      default:
        return true
    }
  })
})

// 今日/本周/本月/本年统计
const todayTotal = computed(() => {
  return filteredList.value.reduce((sum, item) => sum + item.totalAmount, 0)
})

const todayCount = computed(() => filteredList.value.length)

const onLoad = (): void => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 500)
}

const onRefresh = (): void => {
  finished.value = false
  onLoad()
}

const goBack = (): void => {
  router.back()
}
</script>
