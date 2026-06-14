# 士多秀 storeshow 数据库设计文档

## 项目概述

士多秀是一个扫码计价系统，主要功能包括：
- 商店信息管理（名称、描述、首页图片）
- 商品管理（增删改查、条码扫描）
- 扫码计价（多订单并行处理）
- 销售记录管理
- 数据统计（今日销售额、销售笔数）

**数据库选型：PocketBase**（基于 SQLite 的嵌入式后端）

---

## 集合（Collection）设计

### 1. 商店信息表 (store_info)

存储商店基本信息，每个用户仅一条记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | text | PRIMARY KEY | PocketBase 自动生成 |
| created | datetime | NOT NULL | 创建时间 |
| updated | datetime | NOT NULL | 更新时间 |
| user_id | relation(users) | NOT NULL, UNIQUE | 关联用户ID |
| name | text | NOT NULL | 商店名称 |
| description | text | - | 商店描述 |
| image | file | - | 商店首页图片 |

**索引建议：**
- `user_id`（唯一关联，查询商店信息）

---

### 2. 商品表 (products)

存储所有商品信息，支持条码扫描识别。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | text | PRIMARY KEY | PocketBase 自动生成 |
| created | datetime | NOT NULL | 创建时间 |
| updated | datetime | NOT NULL | 更新时间 |
| user_id | relation(users) | NOT NULL | 关联用户ID（商品归属） |
| barcode | text | UNIQUE, NOT NULL | 商品条码（EAN-13/EAN-8/CODE-128等） |
| name | text | NOT NULL | 商品名称 |
| image | file | - | 商品图片 |
| price | number | NOT NULL | 商品单价（浮点数，单位：元） |
| unit | text | NOT NULL | 计量单位（包/瓶/盒/袋等） |
| category | text | - | 商品分类（食品/饮料/烟酒/日用品/药品等） |

**索引建议：**
- `barcode`（唯一索引，条码查询高频）
- `user_id`（按用户筛选商品）
- `category`（分类筛选）

---

### 3. 销售记录表 (sales)

存储每笔销售的汇总信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | text | PRIMARY KEY | PocketBase 自动生成 |
| created | datetime | NOT NULL | 销售时间 |
| updated | datetime | NOT NULL | 更新时间 |
| user_id | relation(users) | NOT NULL | 关联用户ID |
| total_amount | number | NOT NULL | 订单总金额（单位：元） |
| item_count | number | NOT NULL | 商品总件数 |

**索引建议：**
- `user_id`（按用户筛选销售记录）
- `created`（按时间查询/统计）

---

### 4. 销售明细表 (sale_items)

存储每笔销售中包含的商品明细。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | text | PRIMARY KEY | PocketBase 自动生成 |
| created | datetime | NOT NULL | 创建时间 |
| updated | datetime | NOT NULL | 更新时间 |
| sale_id | relation(sales) | NOT NULL | 关联销售记录ID |
| product_id | text | NOT NULL | 关联商品ID（快照，商品删除后仍保留） |
| product_name | text | NOT NULL | 商品名称（快照） |
| product_price | number | NOT NULL | 销售时单价（快照，单位：元） |
| product_image | text | - | 商品图片URL（快照） |
| quantity | number | NOT NULL | 购买数量 |
| subtotal | number | NOT NULL | 小计金额（price × quantity，单位：元） |

**索引建议：**
- `sale_id`（关联查询销售明细）
- `product_id`（商品销售统计）

---

## 集合关系图

```
┌─────────────┐       ┌─────────────────┐
│ store_info  │       │     sales       │
├─────────────┤       ├─────────────────┤
│ id (PK)     │       │ id (PK)         │
│ user_id     │       │ user_id         │
│ name        │       │ total_amount    │
│ description │       │ item_count      │
│ image       │       │ created         │
└─────────────┘       ────────┬─────────┘
                               │
┌─────────────┐                │ 1:N
│  products   │                │
├─────────────┤                │
│ id (PK)     │                │
│ user_id     │                ▼
│ barcode     │       ┌─────────────────┐
│ name        │       │   sale_items    │
│ image       │       ├─────────────────┤
│ price       │       │ id (PK)         │
│ unit        │       │ sale_id (FK)    │───→ sales.id
│ category    │       │ product_id      │───→ products.id (逻辑关联)
│ created     │       │ product_name    │
│ updated     │       │ product_price   │
└─────────────┘       │ product_image   │
                      │ quantity        │
                      │ subtotal        │
                      │ created         │
                      └─────────────────┘
```

---

## 设计说明

### 1. PocketBase 约定

- 所有集合自动包含 `id`、`created`、`updated` 字段，无需手动定义
- `id` 为字符串类型（如 `abc123def456`），非自增整数
- 金额使用 `number` 类型（浮点数），前端展示时保留两位小数
- 图片使用 `file` 类型字段，PocketBase 自动处理文件存储和 URL 生成

### 2. 数据快照机制

`sale_items` 中冗余存储商品名称、价格、图片等信息，原因：
- 商品信息可能后续修改或删除
- 销售记录需要保留交易发生时的原始数据
- 避免历史销售记录因商品变更而失真

### 3. 购物车数据

前端购物车（Receipt）数据为**临时状态**，不需要持久化到数据库：
- 用户刷新页面后购物车清空是合理行为
- 如需保留未完成订单，可扩展为 `pending_orders` 集合

### 4. 多订单并行

前端支持最多 4 个订单并行处理（Tab 切换），这是**前端交互状态**，不涉及数据库设计。

### 5. 条码格式

支持前端 html5-qrcode 库识别的条码格式：
- EAN-13
- EAN-8
- CODE-128
- CODE-39
- UPC-A
- UPC-E

### 6. 用户隔离

所有业务数据（商店、商品、销售）均通过 `user_id` 关联到 `users` 集合，实现多用户数据隔离。

---

## PocketBase 集合配置（JSON Schema）

### store_info

```json
{
  "name": "store_info",
  "type": "base",
  "fields": [
    { "name": "user_id", "type": "relation", "required": true, "options": { "collectionId": "users", "maxSelect": 1 } },
    { "name": "name", "type": "text", "required": true },
    { "name": "description", "type": "text" },
    { "name": "image", "type": "file", "options": { "maxSelect": 1, "mimeTypes": ["image/jpeg", "image/png", "image/webp"] } }
  ],
  "indexes": ["CREATE UNIQUE INDEX idx_store_info_user ON store_info(user_id)"],
  "listRule": "user_id = @request.auth.id",
  "viewRule": "user_id = @request.auth.id",
  "createRule": "user_id = @request.auth.id",
  "updateRule": "user_id = @request.auth.id",
  "deleteRule": "user_id = @request.auth.id"
}
```

### products

```json
{
  "name": "products",
  "type": "base",
  "fields": [
    { "name": "user_id", "type": "relation", "required": true, "options": { "collectionId": "users", "maxSelect": 1 } },
    { "name": "barcode", "type": "text", "required": true },
    { "name": "name", "type": "text", "required": true },
    { "name": "image", "type": "file", "options": { "maxSelect": 1, "mimeTypes": ["image/jpeg", "image/png", "image/webp"] } },
    { "name": "price", "type": "number", "required": true },
    { "name": "unit", "type": "text", "required": true },
    { "name": "category", "type": "text" }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_products_barcode ON products(user_id, barcode)",
    "CREATE INDEX idx_products_user ON products(user_id)",
    "CREATE INDEX idx_products_category ON products(category)"
  ],
  "listRule": "user_id = @request.auth.id",
  "viewRule": "user_id = @request.auth.id",
  "createRule": "user_id = @request.auth.id",
  "updateRule": "user_id = @request.auth.id",
  "deleteRule": "user_id = @request.auth.id"
}
```

### sales

```json
{
  "name": "sales",
  "type": "base",
  "fields": [
    { "name": "user_id", "type": "relation", "required": true, "options": { "collectionId": "users", "maxSelect": 1 } },
    { "name": "total_amount", "type": "number", "required": true },
    { "name": "item_count", "type": "number", "required": true }
  ],
  "indexes": [
    "CREATE INDEX idx_sales_user ON sales(user_id)",
    "CREATE INDEX idx_sales_created ON sales(created)"
  ],
  "listRule": "user_id = @request.auth.id",
  "viewRule": "user_id = @request.auth.id",
  "createRule": "user_id = @request.auth.id",
  "updateRule": "user_id = @request.auth.id",
  "deleteRule": "user_id = @request.auth.id"
}
```

### sale_items

```json
{
  "name": "sale_items",
  "type": "base",
  "fields": [
    { "name": "sale_id", "type": "relation", "required": true, "options": { "collectionId": "sales", "maxSelect": 1 } },
    { "name": "product_id", "type": "text", "required": true },
    { "name": "product_name", "type": "text", "required": true },
    { "name": "product_price", "type": "number", "required": true },
    { "name": "product_image", "type": "text" },
    { "name": "quantity", "type": "number", "required": true },
    { "name": "subtotal", "type": "number", "required": true }
  ],
  "indexes": [
    "CREATE INDEX idx_sale_items_sale ON sale_items(sale_id)",
    "CREATE INDEX idx_sale_items_product ON sale_items(product_id)"
  ],
  "listRule": "sale_id.user_id = @request.auth.id",
  "viewRule": "sale_id.user_id = @request.auth.id",
  "createRule": "sale_id.user_id = @request.auth.id",
  "updateRule": "sale_id.user_id = @request.auth.id",
  "deleteRule": "sale_id.user_id = @request.auth.id"
}
```

---

## 待确认事项

1. **是否需要库存管理？** 当前未涉及库存扣减逻辑
2. **是否需要支付方式记录？** 当前未区分现金/微信/支付宝等支付方式
3. **是否需要退款/退货功能？** 当前仅支持正向销售
