# Vue + TypeScript 项目学习指南

## 📚 项目概述

这是一个使用 **Vue 3 + TypeScript + Vite** 构建的移动端用户信息管理系统，适合新手学习现代前端开发。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5.0 | 前端框架（组合式 API） |
| TypeScript | 5.7.0 | 类型安全的 JavaScript |
| Vite | 6.0.0 | 构建工具和开发服务器 |
| Vue Router | 4.5.0 | 路由管理 |
| Vant | 4.9.0 | 移动端 UI 组件库 |
| PocketBase | 0.27.0 | 开源后端服务 |

---

## 🏗️ 项目结构

```
ts-study/
├── .env                    # 环境变量配置
├── .env.example            # 环境变量示例
├── index.html              # HTML 入口文件
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
│
└── src/
    ├── main.ts             # 应用入口文件
    ├── App.vue             # 根组件
    │
    ├── api/
    │   └── pocketbase.ts   # PocketBase 客户端配置
    │
    ├── composables/
    │   └── useUserProfile.ts  # 用户信息管理 Composable
    │
    ├── router/
    │   └── index.ts        # 路由配置和路由守卫
    │
    ├── types/
    │   └── index.ts        # TypeScript 类型定义
    │
    └── views/
        ├── Home.vue        # 首页（用户信息管理）
        ├── Login.vue       # 登录页
        ├── Register.vue    # 注册页
        └── NotFound.vue    # 404 页面
```

---

## 🎯 核心概念学习

### 1. Vue 3 组合式 API（Composition API）

**为什么使用组合式 API？**
- 更好的逻辑组织和复用
- 更好的 TypeScript 支持
- 更灵活的代码结构

**关键语法：**
```typescript
// <script setup> 语法糖
<script setup lang="ts">
import { ref, reactive } from 'vue'

// ref：包装单个值，使其成为响应式
const count = ref(0)

// reactive：包装对象，使其所有属性都成为响应式
const user = reactive({ name: '张三', age: 25 })
</script>
```

### 2. Composable（组合式函数）

**什么是 Composable？**
- 封装和复用有状态的逻辑
- 类似于 React 的 Hooks
- 可以在多个组件中使用

**示例：useUserProfile.ts**
```typescript
export function useUserProfile() {
  // 状态
  const list = ref<UserProfile[]>([])
  const loading = ref(false)
  
  // 方法
  const loadList = async () => {
    // 加载逻辑
  }
  
  // 返回状态和方法
  return {
    list,
    loading,
    loadList
  }
}
```

**在组件中使用：**
```typescript
const { list, loading, loadList } = useUserProfile()
```

### 3. TypeScript 类型系统

**为什么使用 TypeScript？**
- 类型安全，减少运行时错误
- 更好的代码提示和自动补全
- 更容易维护大型项目

**关键类型定义：**
```typescript
// 接口：定义对象结构
export interface UserProfile {
  id: string
  username: string
  age?: number  // ? 表示可选属性
}

// 类型断言：强制转换类型
const data = result as unknown as UserProfile[]
```

### 4. Vue Router 路由管理

**路由配置：**
```typescript
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }  // 路由元信息
  }
]
```

**路由守卫：**
```typescript
router.beforeEach((to, from, next) => {
  // 权限验证逻辑
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})
```

**路由跳转：**
```typescript
// 使用路由名称（推荐）
router.push({ name: ROUTE_NAMES.HOME })

// 使用路由路径
router.push('/')
```

### 5. 环境变量配置

**为什么使用环境变量？**
- 不同环境使用不同配置
- 避免硬编码敏感信息
- 便于部署和切换环境

**使用方法：**
```typescript
// .env 文件
VITE_POCKETBASE_URL=https://ma.cloud-ip.cc

// 代码中访问
const url = import.meta.env.VITE_POCKETBASE_URL
```

---

## 📖 学习路径建议

### 第一阶段：理解基础
1. 阅读 `main.ts` - 理解 Vue 应用启动流程
2. 阅读 `App.vue` - 理解根组件和 router-view
3. 阅读 `router/index.ts` - 理解路由配置和守卫

### 第二阶段：学习组件开发
1. 阅读 `Login.vue` - 学习表单和事件处理
2. 阅读 `Register.vue` - 学习表单验证
3. 阅读 `Home.vue` - 学习列表渲染和 CRUD 操作

### 第三阶段：进阶学习
1. 阅读 `useUserProfile.ts` - 学习 Composable 模式
2. 阅读 `types/index.ts` - 学习 TypeScript 类型定义
3. 阅读 `pocketbase.ts` - 学习 API 配置

---

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 📝 最佳实践总结

### 1. 代码组织
- ✅ 使用 Composable 封装业务逻辑
- ✅ 使用类型定义文件集中管理类型
- ✅ 使用路由名称常量避免拼写错误

### 2. TypeScript 使用
- ✅ 避免使用 `any` 类型
- ✅ 使用接口定义对象结构
- ✅ 使用类型断言处理第三方库返回类型

### 3. 错误处理
- ✅ 使用 try-catch 捕获异步错误
- ✅ 定义错误类型接口
- ✅ 提供友好的错误提示

### 4. 表单验证
- ✅ 使用正则表达式验证格式
- ✅ 使用自定义验证函数验证逻辑
- ✅ 提供清晰的错误消息

---

## 🚀 下一步学习建议

1. **添加更多功能**
   - 用户头像上传
   - 数据搜索和筛选
   - 数据导出功能

2. **学习更多技术**
   - Pinia（状态管理）
   - VueUse（常用 Composable 库）
   - Axios（HTTP 请求库）

3. **优化项目**
   - 添加单元测试
   - 添加国际化支持
   - 优化性能和加载速度

---

## 📚 推荐学习资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [Vant 组件库文档](https://vant-ui.github.io/vant/)
- [PocketBase 官方文档](https://pocketbase.io/docs/)