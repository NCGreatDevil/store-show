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
          <div class="text-right shrink-0 ml-2">
            <div class="text-base font-bold text-gray-800">¥{{ item.price.toFixed(2) }}</div>
            <div class="text-xs text-gray-400">{{ item.unit }}</div>
          </div>
          <van-icon name="arrow" class="text-gray-300 ml-2 shrink-0" />
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty v-if="!loading && list.length === 0" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '../router'
import type { Product } from '../types'
import pb from '../api/pocketbase'

const router = useRouter()

// 搜索文本
const searchText = ref('')

// 列表状态
const list = ref<Product[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 分页参数
const page = ref(1)
const perPage = 20
let loadingLock = false

// 加载商品列表
const loadProducts = async (isRefresh = false): Promise<void> => {
  if (loadingLock) return
  loadingLock = true

  if (isRefresh) {
    page.value = 1
    list.value = []
    finished.value = false
  }

  try {
    const records = await pb.collection('products').getList<Product>(page.value, perPage, {
      sort: '-created',
      filter: searchText.value
        ? `name ~ "${searchText.value}" || barcode ~ "${searchText.value}"`
        : undefined
    })

    if (isRefresh) {
      list.value = records.items
    } else {
      list.value = [...list.value, ...records.items]
    }

    page.value++
    finished.value = records.items.length < perPage
  } catch (error) {
    console.error('加载商品失败:', error)
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
    loadingLock = false
  }
}

const onLoad = (): void => {
  loading.value = true
  loadProducts()
}

const onRefresh = (): void => {
  refreshing.value = true
  loadProducts(true)
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

onMounted(() => {
  loadProducts(true)
})
</script>
