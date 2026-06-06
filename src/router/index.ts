/**
 * 路由配置文件
 * 定义应用的所有路由规则和导航守卫
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 导入页面组件
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import NotFound from '../views/NotFound.vue'
import pb from '../api/pocketbase'

/**
 * 路由名称常量
 * 使用常量避免路由名称拼写错误
 * 建议在跳转时使用 name 而不是 path
 */
export const ROUTE_NAMES = {
  HOME: 'home',           // 首页（用户信息管理）
  LOGIN: 'login',         // 登录页
  REGISTER: 'register',   // 注册页
  NOT_FOUND: 'notFound'   // 404 页面
} as const

/**
 * 路由配置数组
 * 每个路由对象包含：
 * - path: 路由路径
 * - name: 路由名称（使用 ROUTE_NAMES 常量）
 * - component: 页面组件
 * - meta: 路由元信息（如是否需要认证）
 */
const routes: RouteRecordRaw[] = [
  // 首页：需要登录认证
  {
    path: '/',
    name: ROUTE_NAMES.HOME,
    component: Home,
    meta: { requiresAuth: true }
  },
  // 登录页：无需认证
  {
    path: '/login',
    name: ROUTE_NAMES.LOGIN,
    component: Login
  },
  // 注册页：无需认证
  {
    path: '/register',
    name: ROUTE_NAMES.REGISTER,
    component: Register
  },
  // 扫描页：需要登录认证（复用 Home 组件）
  {
    path: '/scan',
    name: 'scan',
    component: Home,
    meta: { requiresAuth: true }
  },
  // 收款页：需要登录认证（复用 Home 组件）
  {
    path: '/cart',
    name: 'cart',
    component: Home,
    meta: { requiresAuth: true }
  },
  // 商品页：需要登录认证（复用 Home 组件）
  {
    path: '/products',
    name: 'products',
    component: Home,
    meta: { requiresAuth: true }
  },
  // 404 页面：捕获所有未匹配的路由
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.NOT_FOUND,
    component: NotFound
  }
]

// 创建路由实例
const router = createRouter({
  // 使用 HTML5 History 模式（需要服务器配置支持）
  history: createWebHistory(),
  routes
})

/**
 * 全局路由守卫
 * 在每次路由跳转前执行，用于权限验证
 * 
 * @param to - 目标路由
 * @param from - 来源路由
 * @param next - 继续导航的函数
 */
router.beforeEach((to, _from, next) => {
  // 检查目标路由是否需要认证
  const requiresAuth = to.meta.requiresAuth
  
  // 检查用户是否已登录（通过 PocketBase 的认证状态）
  const isAuthenticated = pb.authStore.isValid
  
  if (requiresAuth && !isAuthenticated) {
    // 需要认证但未登录，跳转到登录页
    next({ name: ROUTE_NAMES.LOGIN })
  } else {
    // 允许导航继续
    next()
  }
})

export default router