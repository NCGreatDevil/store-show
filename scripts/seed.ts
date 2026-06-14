/**
 * 插入测试数据到 PocketBase
 * 使用用户认证 token 插入数据
 * 
 * 使用方式：npx tsx scripts/seed.ts
 */

const PB_URL = 'https://ma.cloud-ip.cc'
// ⚠️ 需要提醒用户：此 token 会过期，过期后需要重新获取
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9uSWQiOiJfcGJfdXNlcnNfYXV0aF8iLCJleHAiOjE3ODE3NDY5NDksImlkIjoibzd3bHdpZGViNmZkaHVmIiwicmVmcmVzaGFibGUiOnRydWUsInR5cGUiOiJhdXRoIn0.jnAR4t3m6rMWvyG7UhuL0lNjtpz69TCrig_y9THrBZs'

async function api(method: string, path: string, body?: Record<string, unknown>) {
  const url = `${PB_URL}/api/collections/${path}`
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${USER_TOKEN}`
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`${method} ${path} failed: ${res.status} ${JSON.stringify(data)}`)
  }
  return data
}

async function seed() {
  // 解码 token 获取用户 ID
  const payload = JSON.parse(atob(USER_TOKEN.split('.')[1]))
  const userId = payload.id
  console.log('👤 当前用户 ID:', userId)

  // 1. 创建商店信息
  console.log('\n🏪 创建商店信息...')
  try {
    await api('POST', 'store_info/records', {
      user_id: userId,
      name: '幸福士多',
      description: '社区便利店，商品齐全，价格实惠'
    })
    console.log('✅ 商店信息创建成功')
  } catch (e: any) {
    if (e.message.includes('not_unique') || e.message.includes('unique')) {
      console.log('⏭️ 商店信息已存在')
    } else {
      console.error('❌ 商店信息操作失败:', e.message)
    }
  }

  // 2. 创建商品
  console.log('\n📦 创建商品...')
  const products = [
    { barcode: '6901028001721', name: '薯片', price: 8.5, unit: '包', category: '零食' },
    { barcode: '6920202888888', name: '可乐', price: 3.0, unit: '瓶', category: '饮料' },
    { barcode: '6954767420015', name: '辣条', price: 2.5, unit: '包', category: '零食' },
    { barcode: '6902080500014', name: '棒棒糖', price: 1.0, unit: '支', category: '零食' },
    { barcode: '6955570501011', name: '冰红茶', price: 4.0, unit: '瓶', category: '饮料' },
    { barcode: '6901028001722', name: '香肠', price: 3.5, unit: '根', category: '零食' },
    { barcode: '6901028001723', name: '干脆面', price: 2.0, unit: '包', category: '零食' },
    { barcode: '6901234567890', name: '矿泉水', price: 2.0, unit: '瓶', category: '饮料' },
    { barcode: '6901234567891', name: '饼干', price: 5.5, unit: '盒', category: '零食' },
    { barcode: '6901234567892', name: '口香糖', price: 3.0, unit: '盒', category: '零食' },
  ]

  const createdProducts = []
  for (const p of products) {
    try {
      const record = await api('POST', 'products/records', {
        user_id: userId,
        barcode: p.barcode,
        name: p.name,
        price: p.price,
        unit: p.unit,
        category: p.category
      })
      createdProducts.push(record)
      console.log(`✅ ${p.name} 创建成功`)
    } catch (e: any) {
      if (e.message.includes('not_unique') || e.message.includes('unique')) {
        console.log(`⏭️ ${p.name} 已存在`)
      } else {
        console.error(`❌ ${p.name} 失败:`, e.message)
      }
    }
  }

  // 3. 创建销售记录
  console.log('\n💰 创建销售记录...')
  const now = new Date()
  const salesData = [
    {
      total_amount: 14.0,
      item_count: 3,
      created: new Date(now.getTime() - 3600000).toISOString(),
      items: [{ productIndex: 1, quantity: 2 }, { productIndex: 2, quantity: 1 }]
    },
    {
      total_amount: 11.5,
      item_count: 3,
      created: new Date(now.getTime() - 7200000).toISOString(),
      items: [{ productIndex: 0, quantity: 1 }, { productIndex: 3, quantity: 2 }]
    },
    {
      total_amount: 6.0,
      item_count: 3,
      created: new Date(now.getTime() - 86400000).toISOString(),
      items: [{ productIndex: 7, quantity: 2 }, { productIndex: 9, quantity: 1 }]
    },
  ]

  for (const sale of salesData) {
    try {
      const saleRecord = await api('POST', 'sales/records', {
        user_id: userId,
        total_amount: sale.total_amount,
        item_count: sale.item_count,
        created: sale.created
      })
      console.log(`✅ 销售记录 (¥${sale.total_amount})`)

      for (const item of sale.items) {
        const product = createdProducts[item.productIndex]
        if (!product) {
          console.log(`⚠️ 商品索引 ${item.productIndex} 不存在`)
          continue
        }
        await api('POST', 'sale_items/records', {
          sale_id: saleRecord.id,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: '',
          quantity: item.quantity,
          subtotal: product.price * item.quantity
        })
      }
    } catch (e: any) {
      console.error('❌ 销售记录失败:', e.message)
    }
  }

  console.log('\n🎉 测试数据插入完成！')
}

seed().catch(console.error)
