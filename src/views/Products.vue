<template>
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar title="商品管理" fixed placeholder border z-index="100">
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

    <!-- 下拉刷新 + 无限滚动 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <van-cell
          v-for="item in filteredList"
          :key="item.id"
          :title="item.name"
          :label="`条码: ${item.barcode}`"
          is-link
          @click="onEdit(item)"
        >
          <template #icon>
            <van-image
              width="48"
              height="48"
              :src="item.image"
              fit="cover"
              class="rounded-lg shrink-0 mr-2"
            />
          </template>
          <template #value>
            <div class="text-right">
              <div class="text-base font-bold text-gray-800">¥{{ item.price.toFixed(2) }}</div>
              <div class="text-xs text-gray-400">{{ item.unit }}</div>
            </div>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty v-if="!loading && filteredList.length === 0" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useProduct } from '../composables/useProduct'
import { ROUTE_NAMES } from '../router'
import type { Product } from '../types'

const router = useRouter()

const searchText = ref('')

const {
  list,
  loading,
  finished,
  refreshing,
  loadList,
  refreshList
} = useProduct()

// 搜索过滤
const filteredList = computed(() => {
  if (!searchText.value) return list.value
  const keyword = searchText.value.toLowerCase()
  return list.value.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword) ||
      item.barcode.toLowerCase().includes(keyword)
  )
})

const onLoad = (): void => {
  loading.value = true
  loadList()
}

const onRefresh = (): void => {
  refreshList()
}

const onAdd = (): void => {
  router.push({ name: ROUTE_NAMES.PRODUCTS_EDIT })
}

const onEdit = (item: Product): void => {
  router.push({
    name: ROUTE_NAMES.PRODUCTS_EDIT,
    query: { product: JSON.stringify(item) }
  })
}

const goBack = (): void => {
  router.back()
}

onMounted(() => {
  loadList()
})

onActivated(() => {
  refreshList()
})
</script>
