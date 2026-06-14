# PocketBase 集合创建指令

## 任务目标

在 PocketBase 服务器上创建以下 4 个集合（Collection），用于士多秀扫码计价系统。

## 集合设计

### 1. store_info（商店信息表）

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

### 2. products（商品表）

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

### 3. sales（销售记录表）

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

### 4. sale_items（销售明细表）

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

## 创建方式

### 方式一：使用 PocketBase Admin API（推荐）

使用 curl 命令通过 Admin API 创建集合：

```bash
# 1. 先登录获取 admin token
curl -X POST 'http://localhost:8090/api/admins/auth-with-password' \
  -H 'Content-Type: application/json' \
  -d '{"identity": "ADMIN_EMAIL", "password": "ADMIN_PASSWORD"}'

# 2. 使用 token 创建集合（以 store_info 为例）
curl -X POST 'http://localhost:8090/api/collections' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
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
  }'
```




## 注意事项

1. **创建顺序**：先创建 `sales`，再创建 `sale_items`（因为 sale_items 依赖 sales 集合）
2. **users 集合**：PocketBase 默认自带，无需创建
3. **索引**：创建集合后再添加索引，或者在创建时一并提交
4. **API 规则**：确保所有集合都设置了正确的用户隔离规则
