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

    <van-cell-group class="mx-2 my-4 pt-4 pb-[50px]" v-if="scannedItems.length > 0">
      <van-cell 
        v-for="item in scannedItems" 
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
          />
        </template>
      </van-cell>
    </van-cell-group>

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
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { storeToRefs } from 'pinia'
import { useReceiptStore } from '../stores/useReceiptStore'
import { ROUTE_NAMES } from '../router'
import type { ReceiptItem } from '../types'

const router = useRouter()
const store = useReceiptStore()
const { firstEmptyIndex, isFull } = storeToRefs(store)
const { addItemsToActive, addReceipt, switchTo } = store

// 扫描器相关
let html5QrCode: Html5Qrcode | null = null; 
const isScanning = ref(false);

// 扫描到的商品列表
const scannedItems = ref<ReceiptItem[]>([
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
]);

const totalPrice = computed(() => {
  return Math.round(
    scannedItems.value.reduce((sum, item) => sum + item.productPrice * item.quantity, 0) * 100
  );
});

const quantity = computed(() => {
  return scannedItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

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
        showToast('商品已加入列表');
      } catch {
        showToast('该编码商品未能识别');
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
  // 跳转到收款页
  router.push({ name: ROUTE_NAMES.CART })
}

onMounted(async () => {
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
