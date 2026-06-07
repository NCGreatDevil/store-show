<template>
  <!-- 
    根组件：应用的最顶层组件
    
    作用：
    - 作为所有页面组件的容器
    - 使用 router-view 渲染当前路由匹配的组件
    
    router-view 说明：
    - Vue Router 提供的内置组件
    - 会根据当前 URL 显示对应的页面组件
    - 例如：访问 /login 时显示 Login.vue，访问 / 时显示 Home.vue
  -->
  <router-view />

  <van-tabbar
    v-if="showTabbar"
    route
    fixed
    placeholder
    active-color="#409eff"
    inactive-color="#909399"
  >
    <van-tabbar-item to="/" icon="shop-o">首页</van-tabbar-item>
    <van-tabbar-item to="/scan" icon="scan">扫描</van-tabbar-item>
    <van-tabbar-item to="/cart" icon="shopping-cart-o" >
      收款
    </van-tabbar-item>
    <van-tabbar-item to="/products" icon="orders-o">商品</van-tabbar-item>
  </van-tabbar>


</template>

<script setup lang="ts">
/**
 * 根组件脚本
 * 
 * 使用 <script setup> 语法糖（Vue 3 组合式 API）
 * 
 * 特点：
 * - 无需 return，顶层变量自动暴露给模板
 * - 更简洁的代码结构
 * - 更好的 TypeScript 支持
 * 
 * 这个根组件非常简单，只负责渲染路由页面
 * 全局逻辑（如错误处理、全局状态）可以在这里添加
 */

// 根组件不需要额外的逻辑，router-view 会自动渲染匹配的页面

import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// 获取当前路由
const route = useRoute()

// 判断是否显示底部标签栏（根据路由 meta 配置）
const showTabbar = computed(() => {
  return !route.meta.hideTabbar
})

// 选项卡切换事件处理
const active = ref(0)

// 选项卡切换事件处理
const onChange = (index: number): void => {
  active.value = index
  console.log('当前选中:', index)
}
</script>

<style>
/**
 * 全局样式
 * 
 * 注意：这里使用的是普通 <style>（不带 scoped）
 * 所以样式会应用到整个应用
 * 
 * 建议：
 * - 全局样式放在这里（如字体、颜色变量）
 * - 组件样式使用 scoped（避免样式冲突）
 */

/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 设置默认字体 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>