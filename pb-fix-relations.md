# PocketBase 集合 user_id 字段修复指令

## 问题

创建集合时，`user_id` 字段的 `collectionId` 设置为 `"users"`，但实际 PocketBase 的 users 集合 ID 是 `"_pb_users_auth_"`。

这导致创建记录时报错：`validation_missing_rel_collection`

## 修复方案

需要更新以下集合的 `user_id` 字段，将 `collectionId` 从 `"users"` 改为 `"_pb_users_auth_"`：

### 1. store_info

```bash
curl -X PATCH 'https://ma.cloud-ip.cc/api/collections/store_info' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
    "fields": [
      { "name": "user_id", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
      { "name": "name", "type": "text", "required": true },
      { "name": "description", "type": "text" },
      { "name": "image", "type": "file", "options": { "maxSelect": 1, "mimeTypes": ["image/jpeg", "image/png", "image/webp"] } }
    ]
  }'
```

### 2. products

```bash
curl -X PATCH 'https://ma.cloud-ip.cc/api/collections/products' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
    "fields": [
      { "name": "user_id", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
      { "name": "barcode", "type": "text", "required": true },
      { "name": "name", "type": "text", "required": true },
      { "name": "image", "type": "file", "options": { "maxSelect": 1, "mimeTypes": ["image/jpeg", "image/png", "image/webp"] } },
      { "name": "price", "type": "number", "required": true },
      { "name": "unit", "type": "text", "required": true },
      { "name": "category", "type": "text" }
    ]
  }'
```

### 3. sales

```bash
curl -X PATCH 'https://ma.cloud-ip.cc/api/collections/sales' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
    "fields": [
      { "name": "user_id", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
      { "name": "total_amount", "type": "number", "required": true },
      { "name": "item_count", "type": "number", "required": true }
    ]
  }'
```

### 4. sale_items（不需要修改，因为它关联的是 sales 集合）

sale_items 的 `sale_id` 字段关联的是 `sales` 集合，这个集合是我们自己创建的，ID 是正确的（`reffe1819a70330` 或类似）。

## 验证

修复后，尝试创建一条测试记录：

```bash
curl -X POST 'https://ma.cloud-ip.cc/api/collections/store_info/records' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer USER_TOKEN' \
  -d '{
    "user_id": "o7wlwideb6fdhuf",
    "name": "测试商店"
  }'
```

如果返回 200 且包含记录数据，说明修复成功。
