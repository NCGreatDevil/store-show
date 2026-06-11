/**
 * 账单管理 Store (Pinia)
 * 管理最多 4 个独立账单，支持动态新增、切换、提交
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Receipt, ReceiptItem } from '../types'

const MAX_RECEIPTS = 4

let nextId = 1

const createEmptyReceipt = (): Receipt => ({
  id: `receipt-${nextId++}`,
  items: [],
})

export const useReceiptStore = defineStore('receipt', () => {
  const receipts = ref<Receipt[]>([createEmptyReceipt()])
  const activeIndex = ref(0)

  const activeReceipt = computed(() => receipts.value[activeIndex.value])
  const count = computed(() => receipts.value.length)
  const isFull = computed(() => receipts.value.length >= MAX_RECEIPTS)
  const firstEmptyIndex = computed(() => receipts.value.findIndex((r) => r.items.length === 0))

  /** 新增账单 */
  function addReceipt(): boolean {
    if (receipts.value.length >= MAX_RECEIPTS) return false
    receipts.value.push(createEmptyReceipt())
    activeIndex.value = receipts.value.length - 1
    return true
  }

  /** 切换到指定账单 */
  function switchTo(index: number): void {
    if (index >= 0 && index < receipts.value.length) {
      activeIndex.value = index
    }
  }

  /** 提交指定账单（清空并移除） */
  function submitReceipt(index: number): void {
    if (index < 0 || index >= receipts.value.length) return
    receipts.value.splice(index, 1)
    if (receipts.value.length === 0) {
      receipts.value.push(createEmptyReceipt())
    }
    if (activeIndex.value >= receipts.value.length) {
      activeIndex.value = receipts.value.length - 1
    }
  }

  /** 添加商品到当前账单 */
  function addItemToActive(item: ReceiptItem): void {
    const existing = activeReceipt.value.items.find((i) => i.productId === item.productId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      activeReceipt.value.items.push({ ...item })
    }
  }

  /** 批量添加商品到当前账单 */
  function addItemsToActive(items: ReceiptItem[]): void {
    items.forEach((item) => addItemToActive(item))
  }

  /** 商品数量变化 */
  function onQuantityChange(productId: string, value: number): void {
    const item = activeReceipt.value.items.find((i) => i.productId === productId)
    if (item) {
      item.quantity = value
    }
  }

  return {
    receipts,
    activeIndex,
    activeReceipt,
    count,
    isFull,
    firstEmptyIndex,
    addReceipt,
    switchTo,
    submitReceipt,
    addItemToActive,
    addItemsToActive,
    onQuantityChange,
  }
})
