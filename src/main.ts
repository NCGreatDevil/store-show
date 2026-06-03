/**
 * 应用入口文件
 * 
 * 这是 Vue 应用的启动文件，负责：
 * 1. 创建 Vue 应用实例
 * 2. 注册全局插件和组件
 * 3. 挂载应用到 DOM
 * 
 * Vue 3 的启动流程（使用组合式 API）：
 * - createApp() - 创建应用实例
 * - app.use() - 注册插件（路由、状态管理、UI组件库等）
 * - app.mount() - 挂载到 DOM 元素
 */

// ==================== 导入依赖 ====================

// Vue 核心函数
import { createApp } from 'vue'

// 根组件
import App from './App.vue'

// 路由配置
import router from './router'

// Vant UI 组件库（移动端组件库）
import Vant from 'vant'

// Vant 组件库样式
import 'vant/lib/index.css'

// ==================== 创建应用 ====================

/**
 * 创建 Vue 应用实例
 * 传入根组件 App.vue
 */
const app = createApp(App)

// ==================== 注册插件 ====================

/**
 * 注册路由插件
 * 使应用支持页面导航和路由守卫
 */
app.use(router)

/**
 * 注册 Vant UI 组件库
 * 可以在所有组件中使用 Vant 组件，无需单独导入
 * 例如：<van-button>, <van-field>, <van-dialog> 等
 */
app.use(Vant)

// ==================== 挂载应用 ====================

/**
 * 将应用挂载到 DOM
 * 挂载点：index.html 中的 <div id="app"></div>
 * 
 * 挂载后：
 * - Vue 应用开始运行
 * - 路由开始监听 URL 变化
 * - 组件开始渲染
 */
app.mount('#app')