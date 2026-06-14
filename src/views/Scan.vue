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
      left-arrow
      @click-left="onBack"
    ></van-nav-bar>
    <div class="main pb-[50px]" >
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

      <van-cell-group class="mx-2 my-4 pt-4" v-if="scannedItems.length > 0">
        <van-cell 
          v-for="item in scannedItems" 
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
    </div>

    <van-submit-bar
      v-if="scannedItems.length > 0"
      :price="totalPrice"
      button-text="提交账单"
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
import { Html5Qrcode } from 'html5-qrcode';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { storeToRefs } from 'pinia'
import { useReceiptStore } from '../stores/useReceiptStore'
import { ROUTE_NAMES } from '../router'
import type { ReceiptItem } from '../types'
import pb from '../api/pocketbase'

const router = useRouter()
const store = useReceiptStore()
const { firstEmptyIndex, isFull } = storeToRefs(store)
const { addItemsToActive, addReceipt, switchTo } = store

// 扫描器相关
let html5QrCode: Html5Qrcode | null = null; 
const isScanning = ref(false);

// 扫描到的商品列表
const scannedItems = ref<ReceiptItem[]>([]);

// 从 localStorage 恢复扫描数据
const STORAGE_KEY = 'scan_items'
const loadScannedItems = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      scannedItems.value = JSON.parse(saved)
    }
  } catch {
    // 忽略解析错误
  }
}

const saveScannedItems = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scannedItems.value))
}

const clearScannedItems = () => {
  localStorage.removeItem(STORAGE_KEY)
}

// 自动保存到 localStorage
watch(scannedItems, () => {
  saveScannedItems()
}, { deep: true })

const totalPrice = computed(() => {
  return Math.round(
    scannedItems.value.reduce((sum, item) => sum + item.productPrice * item.quantity, 0) * 100
  );
});

const quantity = computed(() => {
  return scannedItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

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
      const index = scannedItems.value.findIndex(i => i.productId === item.productId)
      if (index !== -1) {
        scannedItems.value.splice(index, 1)
      }
    } catch {
      // 用户取消，恢复数量为 1
      item.quantity = 1
    }
  }
};

const INACTIVITY_TIMEOUT = 30000;
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

const resetInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  if (isScanning.value) {
    inactivityTimer = window.setTimeout(async () => {
      showToast('摄像头因长时间没有录入，自动关闭');
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
      resetInactivityTimer();
      await html5QrCode!.pause();
      const pausedTextEl = document.querySelector('#scan-container > div:nth-child(4)');
      if (pausedTextEl) {
        pausedTextEl.textContent = '正在识别';
      }
      try {
        // 从 PocketBase 查询商品
        const records = await pb.collection('products').getList(1, 1, {
          filter: `barcode = "${decodedText}"`
        })
        
        if (records.items.length > 0) {
          const product = records.items[0]
          const imageUrl = product.image ? pb.files.getURL(product, product.image) : ''
          // 检查是否已存在
          const existing = scannedItems.value.find(item => item.productId === product.id)
          if (existing) {
            existing.quantity++
          } else {
            scannedItems.value.push({
              productId: product.id,
              productName: product.name,
              productPrice: product.price,
              productImage: imageUrl,
              quantity: 1,
              unit: product.unit
            })
          }
          showToast(`${product.name} 已加入列表`)
        } else {
          // 商品不存在，询问是否添加
          try {
            await showConfirmDialog({
              title: '未找到该商品',
              message: `条码 ${decodedText} 不在商品列表中，是否添加到商品管理？`,
              confirmButtonText: '去添加',
              cancelButtonText: '取消'
            })
            // 用户确认，跳转到新增商品页，携带条码
            router.push({
              name: ROUTE_NAMES.PRODUCTS_EDIT,
              query: { barcode: decodedText }
            })
          } catch {
            // 用户取消，不做处理
          }
        }
      } catch {
        showToast('该编码商品未能识别')
      }
      setTimeout(async () => {
        await html5QrCode!.resume();
      }, 1000);
    },
    () => {}
  );
  isScanning.value = true;
  resetInactivityTimer();
};

const toggleScan = async () => {
  try {
    if (isScanning.value && html5QrCode) {
      await html5QrCode.stop();
      html5QrCode.clear();
      isScanning.value = false;
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }
    } else {
      await startScanner();
    }
  } catch (error) {
    console.error('切换失败:', error);
  }
};

/** 返回上一页 */
const onBack = (): void => {
  router.back()
}

/** 提交账单：同步商品到账单 store */
const onSubmit = (): void => {
  if (scannedItems.value.length === 0) {
    showToast('暂无商品可提交')
    return
  }

  // 优先找空账单
  const emptyIdx = firstEmptyIndex.value
  if (emptyIdx >= 0) {
    // 切换到空账单并添加商品
    switchTo(emptyIdx)
    addItemsToActive(scannedItems.value)
  } else if (!isFull.value) {
    // 没有空账单但未满，新建一个
    addReceipt()
    addItemsToActive(scannedItems.value)
  } else {
    // 四个都满了
    showToast('账单空间已满，请先处理现有的四个账单')
    return
  }

  showToast('商品已同步到账单')
  // 清空扫描列表
  scannedItems.value = []
  clearScannedItems()
  // 跳转到收款页
  router.push({ name: ROUTE_NAMES.CART })
}

onMounted(async () => {
  loadScannedItems()
  await startScanner();
});

onUnmounted(async () => {
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
