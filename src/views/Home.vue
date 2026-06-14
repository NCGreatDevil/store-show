<template>
  <!-- 首页 -->
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar 
    :title="pageTitle"
    fixed
    placeholder
    border
    ></van-nav-bar>
    <div class="main pb-[10px]" >
      <van-row class="m-2">
        <van-col span="24" class="text-center aspect-video">
          <div v-if="storeInfo.loading" class="flex items-center justify-center h-full">
            <van-skeleton-image round class="w-full" />
          </div>
          <van-image
            v-else-if="storeImage"
            width="100%"
            height="100%"
            fit="cover"
            :src="storeImage"
          />
          <van-empty v-else description="暂无图片" />
        </van-col>
      </van-row>
      <van-row class="m-2">
        <van-col span="24" class="text-center">
          <van-button type="primary" size="large" color="linear-gradient(to right, #4bb0ff, #6149f6)" @click="gotoScan">扫描商品</van-button>
        </van-col>
      </van-row>

      <!-- 统计卡片 -->
      <van-grid :column-num="2" :border="false" class="m-3 border border-gray-200 rounded-xl overflow-hidden">
        <van-grid-item>
          <div class="stat-card bg-gray-50 rounded-xl p-4 shadow-sm">
            <div class="stat-value text-blue-500 text-xl font-bold">¥{{ todayTotalAmount.toFixed(2) }}</div>
            <div class="stat-label text-gray-500 mt-1">今日销售额</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card bg-gray-50 rounded-xl p-4 shadow-sm">
            <div class="stat-value text-blue-500 text-xl font-bold">{{ todaySaleCount }}</div>
            <div class="stat-label text-gray-500 mt-1">今日订单</div>
          </div>
        </van-grid-item>
      </van-grid>

      <!-- 热销商品 -->
      <div class="mx-3 mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-700 font-medium"><van-icon name="fire" color="#ee0a24" />热销商品</span>
          <van-radio-group v-model="isWeekly" direction="horizontal" icon-size="16px" @change="togglePeriod">
            <van-radio :name="false">按天</van-radio>
            <van-radio :name="true">按周</van-radio>
          </van-radio-group>
        </div>
        <van-cell-group class="border border-gray-200 rounded-xl overflow-hidden">
          <van-cell
            v-for="item in hotProducts"
            :key="item.productId"
          >
            <template #icon>
              <van-image width="52" height="52" :src="item.productImage" fit="cover" />
            </template>
            <template #title>
              <span class="ml-2">{{ item.productName }}</span>
            </template>
            <template #label>
              <span class="ml-2">¥{{ item.productPrice.toFixed(2) }}/{{ item.unit }}</span>
            </template>
            <template #right-icon>
              <div class="text-center">
                <div class="text-blue-500 font-bold">{{ item.sales }}</div>
                <div class="text-gray-400 text-xs">{{ isWeekly ? '本周' : '今日' }}</div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
        <van-empty v-if="!loading && hotProducts.length === 0" description="暂无销售数据" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '../router'
import { useStoreInfo } from '../stores/useStoreInfo'
import { useHomeStats } from '../composables/useHomeStats'

const router = useRouter()
const storeInfo = useStoreInfo()
const {
  todayTotalAmount,
  todaySaleCount,
  hotProducts,
  loading,
  isWeekly,
  loadStats,
  togglePeriod
} = useHomeStats()

onMounted(() => {
  storeInfo.load()
  loadStats()
})

const pageTitle = computed(() => {
  const name = storeInfo.name || '首页'
  return `${name}-首页`
})

const storeImage = computed(() => storeInfo.imageUrl)

const gotoScan = (): void => {
  router.push({ name: ROUTE_NAMES.SCAN })
}
</script>
