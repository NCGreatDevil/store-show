<template>
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar 
      title="商品管理"
      fixed
      placeholder
      border
      z-index="100"
    >
        <template #left>
        <van-icon name="arrow-left" @click="goBack" />
      </template>
      <template #right>
        <van-icon name="plus" @click="onAdd" />
      </template>
  </van-nav-bar>


    <!-- 搜索栏 -->
    <van-sticky :offset-top="48">
      <van-search
        v-model="searchText"
        placeholder="搜索商品名称或条码"
        shape="round"
        background="#ffffff"
      />
    </van-sticky>

    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <!-- 商品卡片 -->
        <div
          v-for="item in list"
          :key="item.id"
          class="mx-2 mt-2 bg-white rounded-xl shadow-sm p-2 flex items-center"
          @click="onEdit(item)"
        >
          <!-- 商品图片 -->
          <van-image
            width="64"
            height="64"
            :src="item.image"
            fit="cover"
            class="rounded-lg shrink-0"
          />
          <!-- 商品信息 -->
          <div class="flex-1 ml-4 min-w-0">
            <div class="text-sm font-medium text-gray-800 line-clamp-2">{{ item.name }}</div>
            <div class="text-xs text-gray-400 mt-1">条码: {{ item.barcode }}</div>
          </div>
          <!-- 价格 -->
          <div class="text-right flex-shrink-0 ml-2">
            <div class="text-base font-bold text-gray-800">¥{{ item.price.toFixed(2) }}</div>
            <div class="text-xs text-gray-400">{{ item.unit }}</div>
          </div>
          <van-icon name="arrow" class="text-gray-300 ml-2 flex-shrink-0" />
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty v-if="!loading && list.length === 0" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '../router'
import type { Product } from '../types'

const router = useRouter()

// 搜索文本
const searchText = ref('')

// 列表状态
const list = ref<Product[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 模拟商品数据
const mockProducts: Product[] = [
  {
    id: 'p1',
    barcode: '6901028001721',
    name: '薯片',
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5pav54mGPC90ZXh0Pjwvc3ZnPg==',
    price: 8.5,
    unit: '包',
    category: '零食',
  },
  {
    id: 'p2',
    barcode: '6920202888888',
    name: '可乐',
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Y+v5LmQPC90ZXh0Pjwvc3ZnPg==',
    price: 3.0,
    unit: '瓶',
    category: '饮料',
  },
  {
    id: 'p3',
    barcode: '6954767420015',
    name: '辣条',
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+6L6j5p2hPC90ZXh0Pjwvc3ZnPg==',
    price: 2.5,
    unit: '包',
    category: '零食',
  },
  {
    id: 'p4',
    barcode: '6902080500014',
    name: '棒棒糖',
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5L2c6L6hPC90ZXh0Pjwvc3ZnPg==',
    price: 1.0,
    unit: '支',
    category: '零食',
  },
  {
    id: 'p5',
    barcode: '6955570501011',
    name: '冰红茶',
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5L2e5pir5LqM5rW0PC90ZXh0Pjwvc3ZnPg==',
    price: 4.0,
    unit: '瓶',
    category: '饮料',
  },
  {
    id: 'p6',
    barcode: '6901028001722',
    name: '香肠',
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5byA5Y+IPC90ZXh0Pjwvc3ZnPg==',
    price: 3.5,
    unit: '根',
    category: '零食',
  },
  {
    id: 'p7',
    barcode: '6901028001723',
    name: '干脆面',
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5bGx5Zu96ZmGPC90ZXh0Pjwvc3ZnPg==',
    price: 2.0,
    unit: '包',
    category: '零食',
  },
]

const onLoad = (): void => {
  // 模拟异步加载
  setTimeout(() => {
    list.value = [...list.value, ...mockProducts]
    loading.value = false
    finished.value = true
  }, 500)
}

const onRefresh = (): void => {
  list.value = []
  finished.value = false
  onLoad()
}

const onEdit = (item: Product): void => {
  console.log('编辑商品:', item)
}

const onAdd = (): void => {
  console.log('新增商品')
}

const goBack = (): void => {
  router.back()
}
</script>
