<template>
  <!-- 收款页 -->
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar 
      title="收款"
      fixed
      placeholder
      border
      z-index="100"
    >
      <template #right>
        <van-icon name="plus" size="18" @click="onNewReceipt" />
      </template>
    </van-nav-bar>
    <div class="main pb-[50px]" >
      <van-tabs 
        v-model:active="activeIndex" 
        animated 
        sticky 
        offset-top="48"
        @change="onTabChange"
      >
        <van-tab 
          v-for="(receipt, index) in receipts" 
          :key="receipt.id" 
          :title="`账单 ${index + 1}`"
        >
          <!-- 空账单：中央展示扫描按钮 -->
          <div v-if="receipt.items.length === 0" class="flex flex-col items-center justify-center min-h-[60vh]">
            <van-empty description="暂无商品">
              <van-button 
                round 
                type="primary" 
                class="mt-4"
                @click="goToScan"
              >
                去扫描
              </van-button>
            </van-empty>
          </div>

          <!-- 有商品的账单列表 -->
          <van-cell-group class="mx-2 my-4" v-else>
            <van-cell 
              v-for="item in receipt.items" 
              :key="item.productId"
            >
              <template #title>
                <span class="ml-2">{{ item.productName }}</span>
              </template>
              <template #label>
                <span class="ml-2 text-base font-bold text-gray-800">¥{{ item.productPrice.toFixed(2) }}/{{ item.unit }}</span>
              </template>
              <template #icon>
                <van-image width="52" height="52" :src="item.productImage" fit="cover" />
              </template>
              <template #right-icon>
                <van-stepper 
                  v-model="item.quantity" 
                  :min="0" 
                  :max="99" 
                  class="ml-2" 
                  @change="(value) => onQuantityChange(item, value as number)" 
                />
              </template>
            </van-cell>
          </van-cell-group>
        </van-tab>
      </van-tabs>
    </div>

    <van-submit-bar
      v-if="activeReceipt && activeReceipt.items.length > 0"
      :price="totalPrice"
      button-text="确认收款"
      @submit="onSubmit"
      class="bottom-[50px]!"
    >
      <template #default>
        <span class="van-submit-bar__text">
          数量: 
          <span class="van-submit-bar__price van-submit-bar__price-integer">{{ quantity }}</span>
        </span>
      </template>
    </van-submit-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { storeToRefs } from 'pinia'
import { useReceiptStore } from '../stores/useReceiptStore'
import { ROUTE_NAMES } from '../router'
import type { ReceiptItem } from '../types'
import pb from '../api/pocketbase'

const router = useRouter()
const store = useReceiptStore()

// 使用 storeToRefs 保持响应性
const { receipts, activeIndex, activeReceipt, isFull } = storeToRefs(store)
const { addReceipt, switchTo, submitReceipt, onQuantityChange: storeOnQuantityChange } = store

// 当前账单的总价和数量
const totalPrice = computed(() => {
  if (!activeReceipt.value) return 0
  return Math.round(
    activeReceipt.value.items.reduce((sum: number, item: ReceiptItem) => sum + item.productPrice * item.quantity, 0) * 100
  )
})

const quantity = computed(() => {
  if (!activeReceipt.value) return 0
  return activeReceipt.value.items.reduce((sum: number, item: ReceiptItem) => sum + item.quantity, 0)
})

/** 新增账单 */
const onNewReceipt = (): void => {
  if (!addReceipt()) {
    showToast('账单空间已满，请先处理现有的四个账单')
  }
}

/** Tab 切换 */
const onTabChange = (index: number): void => {
  switchTo(index)
}

/** 跳转到扫描页 */
const goToScan = (): void => {
  router.push({ name: ROUTE_NAMES.SCAN })
}

/** 步进器数量变化 */
const onQuantityChange = async (item: ReceiptItem, value: number): Promise<void> => {
  if (value === 0) {
    try {
      await showConfirmDialog({
        title: '移除商品',
        message: `确定将 ${item.productName} 从账单中移除吗？`,
        confirmButtonText: '移除',
        cancelButtonText: '取消'
      })
      // 用户确认，移除商品
      const index = activeReceipt.value.items.findIndex(i => i.productId === item.productId)
      if (index !== -1) {
        activeReceipt.value.items.splice(index, 1)
      }
    } catch {
      // 用户取消，恢复数量为 1
      item.quantity = 1
    }
  } else {
    // 正常数量变化，调用 store 方法
    storeOnQuantityChange(item.productId, value)
  }
}

/** 提交账单 */
const onSubmit = async (): Promise<void> => {
  if (!activeReceipt.value || activeReceipt.value.items.length === 0) {
    showToast('暂无商品可提交')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认提交',
      message: `确认提交账单？共 ${quantity.value} 件商品，合计 ¥${(totalPrice.value / 100).toFixed(2)}`,
    })

    // 计算总金额
    const totalAmount = activeReceipt.value.items.reduce(
      (sum: number, item: ReceiptItem) => sum + item.productPrice * item.quantity, 0
    )

    // 创建销售记录
    const saleRecord = await pb.collection('sales').create({
      user_id: pb.authStore.record?.id || '',
      total_amount: totalAmount,
      item_count: activeReceipt.value.items.length
    })

    // 创建销售明细
    for (const item of activeReceipt.value.items) {
      await pb.collection('sale_items').create({
        sale_id: saleRecord.id,
        product_id: item.productId,
        product_name: item.productName,
        product_price: item.productPrice,
        product_image: item.productImage,
        quantity: item.quantity,
        subtotal: item.productPrice * item.quantity
      })
    }

    // 提交成功后清空账单
    submitReceipt(activeIndex.value)
    // 重置到第一个 tab
    activeIndex.value = 0
    switchTo(0)
    showToast('提交成功')
  } catch (error: any) {
    if (error?.message !== 'cancel') {
      console.error('提交账单失败:', error)
      showToast('提交失败，请重试')
    }
  }
}
</script>
