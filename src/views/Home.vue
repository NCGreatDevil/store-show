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
          <van-image
            v-if="storeImage"
            width="100%"
            height="100%"
            fit="cover"
            :src="storeImage"
          />
          <van-image
            v-else
            width="100%"
            height="100%"
            fit="cover"
            src="https://img.yzcdn.cn/vant/cat.jpeg"
          />
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
          <van-radio-group v-model="isWeekly" direction="horizontal" icon-size="16px">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '../router'
import { useStoreInfo } from '../stores/useStoreInfo'

const router = useRouter()
const storeInfo = useStoreInfo()

const pageTitle = computed(() => {
  const name = storeInfo.name || '首页'
  return `${name}-首页`
})

const storeImage = computed(() => storeInfo.imageUrl)

// 假数据统计
const todayTotalAmount = ref(1286.50)
const todaySaleCount = ref(42)

// 按天/按周切换，默认按天
const isWeekly = ref(false)

// 热销商品假数据（按销量倒序）
const hotProducts = ref([
  {
    productId: 'p1',
    productName: '可乐',
    productPrice: 3.0,
    productImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU4IiBmb250LWZhbWlseT0iUGluZ0ZhbmcgU0MsTWljcm9zb2Z0IFlhSGVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWPr+S5kDwvdGV4dD48L3N2Zz4=',
    unit: '瓶',
    sales: 128,
  },
  {
    productId: 'p2',
    productName: '薯片',
    productPrice: 8.5,
    productImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU4IiBmb250LWZhbWlseT0iUGluZ0ZhbmcgU0MsTWljcm9zb2Z0IFlhSGVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuiWr+eJhzwvdGV4dD48L3N2Zz4=',
    unit: '包',
    sales: 86,
  },
  {
    productId: 'p3',
    productName: '辣条',
    productPrice: 2.5,
    productImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU4IiBmb250LWZhbWlseT0iUGluZ0ZhbmcgU0MsTWljcm9zb2Z0IFlhSGVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPui+o+adoTwvdGV4dD48L3N2Zz4=',
    unit: '包',
    sales: 65,
  },
  {
    productId: 'p4',
    productName: '矿泉水',
    productPrice: 1.5,
    productImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU4IiBmb250LWZhbWlseT0iUGluZ0ZhbmcgU0MsTWljcm9zb2Z0IFlhSGVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWkqeaYrzwvdGV4dD48L3N2Zz4=',
    unit: '瓶',
    sales: 42,
  },
])

const gotoScan = (): void => {
  router.push({ name: ROUTE_NAMES.SCAN })
}
</script>
