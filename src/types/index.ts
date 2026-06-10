/**
 * 用户信息类型定义
 * 从 PocketBase 的 user_profiles 集合获取的数据结构
 */

/**
 * 用户信息完整数据
 * 包含 PocketBase 自动生成的字段和用户自定义字段
 */
export interface UserProfile {
  // PocketBase 自动生成的字段
  id: string           // 记录唯一标识
  created: string      // 创建时间（ISO 8601 格式）
  updated: string      // 更新时间（ISO 8601 格式）
  
  // 用户关联字段
  user_id: string      // 关联的用户 ID（来自 users 集合）
  
  // 用户自定义字段
  username: string     // 用户名
  age?: number         // 年龄（可选）
  occupation?: string  // 职业（可选）
  phone?: string       // 电话号码（可选）
  bio?: string         // 个人简介（可选）
}

/**
 * 用户信息表单数据
 * 用于创建和编辑用户信息时的表单输入
 * 使用 Pick 从 UserProfile 中选取可编辑字段
 */
export interface UserProfileForm {
  username: string     // 用户名（必填）
  age?: number         // 年龄（可选）
  occupation?: string  // 职业（可选）
  phone?: string       // 电话号码（可选）
  bio?: string         // 个人简介（可选）
}

/**
 * PocketBase 错误响应类型
 * 用于处理 API 请求失败时的错误信息
 */
export interface PocketBaseError {
  code: number         // 错误代码
  message: string      // 错误消息
  data: Record<string, unknown>  // 错误详细数据
}

/**
 * 路由元信息类型
 * 定义路由配置中的 meta 字段结构
 */
export interface RouteMeta {
  requiresAuth?: boolean  // 是否需要登录认证
  title?: string          // 页面标题（可选）
}

/**
 * 账单商品项
 */
export interface ReceiptItem {
  productId: string       // 商品ID
  productName: string     // 商品名称
  productPrice: number    // 商品价格
  productImage: string    // 商品图片
  quantity: number        // 数量
  unit: string            // 单位
}

/**
 * 账单
 */
export interface Receipt {
  id: string
  items: ReceiptItem[]
}