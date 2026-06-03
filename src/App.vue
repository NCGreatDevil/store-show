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