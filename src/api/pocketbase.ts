/**
 * PocketBase 客户端配置
 * 
 * PocketBase 是一个开源的后端服务，提供：
 * - 用户认证（注册、登录、权限管理）
 * - 数据库 CRUD 操作
 * - 实时订阅
 * - 文件存储
 * 
 * 配置说明：
 * - 使用环境变量配置服务器地址
 * - 开发环境使用 .env 文件
 * - 生产环境使用 .env.production 文件
 */

import PocketBase from 'pocketbase'

/**
 * PocketBase 服务器地址
 * 从环境变量获取，便于不同环境切换
 * 
 * 环境变量命名规则：
 * - Vite 要求环境变量以 VITE_ 开头才能在客户端访问
 * - 使用 import.meta.env 访问（Vite 特有方式）
 */
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://ma.cloud-ip.cc'

/**
 * PocketBase 客户端实例
 * 
 * 使用方法：
 * - pb.collection('users') - 操作 users 集合
 * - pb.collection('user_profiles') - 操作 user_profiles 集合
 * - pb.authStore - 访问认证状态
 * 
 * 认证相关：
 * - pb.authStore.token - 获取认证 token
 * - pb.authStore.record - 获取当前用户信息
 * - pb.authStore.isValid - 检查认证是否有效
 * - pb.authStore.clear() - 清除认证信息（退出登录）
 */
const pb = new PocketBase(POCKETBASE_URL)

// 导出 PocketBase 客户端实例
export default pb