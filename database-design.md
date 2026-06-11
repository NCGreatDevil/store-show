# 士多秀 storeshow 数据库设计文档

## 项目概述

士多秀是一个扫码计价系统，主要功能包括：
- 商品管理（增删改查、条码扫描）
- 扫码计价（多订单并行处理）
- 销售记录管理
- 数据统计（今日销售额、销售笔数）

---

## 数据库表设计

### 1. 商品表 (products)

存储所有商品信息，支持条码扫描识别。

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | 商品主键ID |
| barcode | VARCHAR | 64 | UNIQUE, NOT NULL | 商品条码（EAN-13/EAN-8/CODE-128等） |
| name | VARCHAR | 255 | NOT NULL | 商品名称 |
| image | VARCHAR | 512 | - | 商品图片URL |
| price | DECIMAL | 10,2 | NOT NULL | 商品单价 |
| unit | VARCHAR | 32 | NOT NULL | 计量单位（包/瓶/盒/袋等） |
| category | VARCHAR | 64 | - | 商品分类（食品/饮料/烟酒/日用品/药品等） |
| created_at | DATETIME | - | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引建议：**
- 主键索引：`id`
- 唯一索引：`barcode`（条码查询高频）
- 普通索引：`category`（分类筛选）

---

### 2. 销售记录表 (sales)

存储每笔销售的汇总信息。

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | 销售记录主键ID |
| total_amount | DECIMAL | 10,2 | NOT NULL | 订单总金额 |
| item_count | INT | - | NOT NULL | 商品总件数 |
| created_at | DATETIME | - | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 销售时间（即创建时间） |

**索引建议：**
- 主键索引：`id`
- 普通索引：`created_at`（按时间查询/统计）

---

### 3. 销售明细表 (sale_items)

存储每笔销售中包含的商品明细。

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | 明细主键ID |
| sale_id | BIGINT | - | NOT NULL, FOREIGN KEY | 关联销售记录ID |
| product_id | BIGINT | - | NOT NULL | 关联商品ID（快照，商品删除后仍保留） |
| product_name | VARCHAR | 255 | NOT NULL | 商品名称（快照） |
| product_price | DECIMAL | 10,2 | NOT NULL | 销售时单价（快照） |
| product_image | VARCHAR | 512 | - | 商品图片（快照） |
| quantity | INT | - | NOT NULL | 购买数量 |
| subtotal | DECIMAL | 10,2 | NOT NULL | 小计金额（price × quantity） |
| created_at | DATETIME | - | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引建议：**
- 主键索引：`id`
- 普通索引：`sale_id`（关联查询）
- 普通索引：`product_id`（商品销售统计）

---

## 表关系图

```
┌─────────────┐       ┌─────────────────┐
│  products   │       │     sales       │
├─────────────┤       ├─────────────────┤
│ id (PK)     │       │ id (PK)         │
│ barcode     │       │ total_amount    │
│ name        │       │ item_count      │
│ image       │       │ created_at      │
│ price       │       ────────┬────────┘
│ unit        │                │
│ category    │                │ 1:N
│ created_at  │                │
│ updated_at  │                │ 1:N
└─────────────┘                │
                               ▼
                      ┌─────────────────┐
                      │   sale_items    │
                      ├─────────────────┤
                      │ id (PK)         │
                      │ sale_id (FK)    │───┘
                      │ product_id      │───→ products.id (逻辑关联)
                      │ product_name    │
                      │ product_price   │
                      │ product_image   │
                      │ quantity        │
                      │ subtotal        │
                      │ created_at      │
                      └─────────────────┘
```

---

## 设计说明

### 1. 数据快照机制

`sale_items` 表中冗余存储了商品名称、价格、图片等信息，原因：
- 商品信息可能后续修改或删除
- 销售记录需要保留交易发生时的原始数据
- 避免历史销售记录因商品变更而失真

### 2. 购物车数据

前端购物车（Receipt）数据为**临时状态**，不需要持久化到数据库：
- 用户刷新页面后购物车清空是合理行为
- 如需保留未完成订单，可扩展为 `pending_orders` 表

### 3. 多订单并行

前端支持最多3个订单并行处理（Tab切换），这是**前端交互状态**，不涉及数据库设计。

### 4. 金额精度

所有金额字段使用 `DECIMAL(10,2)`，支持最大 99,999,999.99 元，满足小店日常经营需求。

### 5. 条码格式

支持前端 html5-qrcode 库识别的条码格式：
- EAN-13
- EAN-8
- CODE-128
- CODE-39
- UPC-A
- UPC-E

---

## SQL 建表语句（SQLite）

```sql
-- 商品表
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(512),
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(32) NOT NULL,
  category VARCHAR(64),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);

-- 销售记录表
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total_amount DECIMAL(10,2) NOT NULL,
  item_count INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_created_at ON sales(created_at);

-- 销售明细表
CREATE TABLE sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  product_image VARCHAR(512),
  quantity INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
```

---

## 待确认事项

1. **是否需要用户/门店管理？** 当前设计为单店模式，如需多店/多用户需扩展
2. **是否需要库存管理？** 当前未涉及库存扣减逻辑
3. **是否需要支付方式记录？** 当前未区分现金/微信/支付宝等支付方式
4. **是否需要退款/退货功能？** 当前仅支持正向销售
5. **数据库选型？** 当前以 MySQL 为例，如需 PostgreSQL/SQLite 需调整语法
