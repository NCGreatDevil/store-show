/**
 * 首页统计数据 Composable
 * 从 PocketBase 获取今日/本周销售统计和热销商品
 */

import { ref } from 'vue'
import pb from '../api/pocketbase'
import type { PocketBaseError } from '../types'

export interface HotProduct {
  productId: string
  productName: string
  productPrice: number
  productImage: string
  unit: string
  sales: number
}

export function useHomeStats() {
  const todayTotalAmount = ref(0)
  const todaySaleCount = ref(0)
  const hotProducts = ref<HotProduct[]>([])
  const loading = ref(false)
  const isWeekly = ref(false)

  // 获取日期范围
  const getDateRange = () => {
    const now = new Date()
    let start: Date
    let end: Date

    if (isWeekly.value) {
      // 本周：周一 00:00:00 到 周日 23:59:59
      const dayOfWeek = now.getDay() || 7 // 周日为 7
      start = new Date(now)
      start.setDate(now.getDate() - dayOfWeek + 1)
      start.setHours(0, 0, 0, 0)
      end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
    } else {
      // 今日：00:00:00 到 23:59:59
      start = new Date(now)
      start.setHours(0, 0, 0, 0)
      end = new Date(now)
      end.setHours(23, 59, 59, 999)
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    loading.value = true
    try {
      const { start, end } = getDateRange()

      // 查询时间范围内的销售记录
      const sales = await pb.collection('sales').getList(1, 1000, {
        filter: `created >= "${start}" && created <= "${end}"`,
        sort: '-created'
      })

      // 计算今日销售额和订单数
      todayTotalAmount.value = sales.items.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      todaySaleCount.value = sales.items.length

      // 获取所有销售记录的 ID
      const saleIds = sales.items.map(s => s.id)
      if (saleIds.length === 0) {
        hotProducts.value = []
        return
      }

      // 查询销售明细
      const filter = saleIds.map(id => `sale_id = "${id}"`).join(' || ')
      const items = await pb.collection('sale_items').getList(1, 1000, { filter })

      // 按商品聚合销量
      const productMap = new Map<string, HotProduct>()
      for (const item of items.items) {
        const productId = item.product_id
        const existing = productMap.get(productId)
        if (existing) {
          existing.sales += item.quantity || 0
        } else {
          productMap.set(productId, {
            productId,
            productName: item.product_name || '',
            productPrice: item.product_price || 0,
            productImage: item.product_image || '',
            unit: '',
            sales: item.quantity || 0
          })
        }
      }

      // 按销量倒序，取前 10
      hotProducts.value = Array.from(productMap.values())
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10)

      // 获取商品单位信息
      if (hotProducts.value.length > 0) {
        const productIds = hotProducts.value.map(p => p.productId)
        const products = await pb.collection('products').getList(1, 100, {
          filter: productIds.map(id => `id = "${id}"`).join(' || ')
        })
        const unitMap = new Map<string, string>()
        for (const p of products.items) {
          unitMap.set(p.id, p.unit || '')
        }
        for (const hp of hotProducts.value) {
          hp.unit = unitMap.get(hp.productId) || ''
        }
      }
    } catch (error) {
      const err = error as PocketBaseError
      console.error('加载统计数据失败:', err.message)
    } finally {
      loading.value = false
    }
  }

  // 切换按天/按周
  const togglePeriod = async () => {
    await loadStats()
  }

  return {
    todayTotalAmount,
    todaySaleCount,
    hotProducts,
    loading,
    isWeekly,
    loadStats,
    togglePeriod
  }
}
