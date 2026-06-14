<template>
  <!-- 账单详情页 -->
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar title="账单详情" left-arrow @click-left="goBack" fixed placeholder border>
      <template #right>
        <van-button size="small" type="danger" plain @click="onDelete">删除</van-button>
      </template>
    </van-nav-bar>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="flex justify-center mt-10" size="24px" vertical>加载中...</van-loading>

    <!-- 空状态 -->
    <van-empty v-else-if="!sale" description="暂无数据" />

    <!-- 账单信息 -->
    <div v-if="sale" class="mx-3 mt-3 bg-white rounded-xl p-4">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-lg font-bold text-gray-800">{{ formatDateTime(sale.created) }}</div>
          <div class="text-sm text-gray-400 mt-1">订单号: {{ sale.id }}</div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-blue-500">¥{{ sale.total_amount.toFixed(2) }}</div>
          <div class="text-sm text-gray-400 mt-1">{{ sale.item_count }}件商品</div>
        </div>
      </div>
    </div>

    <!-- 商品明细 -->
    <div v-if="sale" class="mx-3 mt-3">
      <div class="text-gray-700 font-medium mb-2">商品明细</div>
      <van-cell-group class="border border-gray-200 rounded-xl overflow-hidden">
        <van-cell
          v-for="item in saleItems"
          :key="item.id"
        >
          <template #icon>
            <van-image
              v-if="item.product_image"
              width="48"
              height="48"
              :src="item.product_image"
              fit="cover"
              class="rounded-lg shrink-0 mr-2"
            />
          </template>
          <template #title>
            <span class="ml-2">{{ item.product_name }}</span>
          </template>
          <template #label>
            <span class="ml-2">¥{{ item.product_price.toFixed(2) }}/{{ item.unit }}</span>
          </template>
          <template #value>
            <div class="text-right">
              <div class="text-base font-bold text-gray-800">×{{ item.quantity }}</div>
              <div class="text-sm text-blue-500">¥{{ (item.product_price * item.quantity).toFixed(2) }}</div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import pb from '../api/pocketbase'
import { formatDateTime } from '../utils/date'

const router = useRouter()
const route = useRoute()

interface SaleItem {
  id: string
  product_id: string
  product_name: string
  product_price: number
  product_image: string
  unit: string
  quantity: number
}

const sale = ref<any>(null)
const saleItems = ref<SaleItem[]>([])
const loading = ref(true)

onMounted(async () => {
  const saleId = route.query.id as string
  if (!saleId) {
    showToast('参数错误')
    router.back()
    return
  }

  try {
    // 加载销售记录
    const record = await pb.collection('sales').getOne(saleId)
    sale.value = record

    // 加载销售明细
    const items = await pb.collection('sale_items').getList(1, 100, {
      filter: `sale_id = "${saleId}"`
    })

    // 处理图片 URL（product_image 存的是完整 URL，直接使用）
    saleItems.value = items.items.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name || '',
      product_price: item.product_price || 0,
      product_image: item.product_image || '',
      unit: item.unit || '',
      quantity: item.quantity || 0
    }))
  } catch {
    showToast('加载失败')
    router.back()
    return
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}

const onDelete = async () => {
  try {
    await showConfirmDialog({
      message: '确定删除该账单吗？'
    })

    // 删除销售明细
    for (const item of saleItems.value) {
      await pb.collection('sale_items').delete(item.id)
    }

    // 删除销售记录
    await pb.collection('sales').delete(sale.value.id)

    showToast('删除成功')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      showToast('删除失败')
    }
  }
}
</script>
