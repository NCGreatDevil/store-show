<template>
  <!-- 商店页 -->
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar title="商店">
      <!-- 右侧退出按钮 -->
      <template #right>
        <van-icon name="cross" @click="onLogout"  color="red" />
      </template>
    </van-nav-bar>


    <van-cell
      is-link
      icon="goods-collect"
      title="商品列表"
      link-type="navigateTo"
      url="/store/products"
    />
    <van-cell
      is-link
      icon="records"
      title="销售记录"
      link-type="navigateTo"
      url="/store/sales"
    />
    <van-cell
      is-link
      icon="shop"
      title="商店信息"
      link-type="navigateTo"
      url="/store/edit"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { ROUTE_NAMES } from '../router'
import pb from '../api/pocketbase'

const router = useRouter()

const onLogout = async (): Promise<void> => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？'
    })
    pb.authStore.clear()
    router.push({ name: ROUTE_NAMES.LOGIN })
  } catch {
    // 用户取消
  }
}
</script>
