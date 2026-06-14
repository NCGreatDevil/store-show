/**
 * 商店信息管理 Store
 * 对接 PocketBase store_info 集合
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import pb from '../api/pocketbase'

export const useStoreInfo = defineStore('storeInfo', () => {
  const name = ref('')
  const description = ref('')
  const imageUrl = ref('')
  const recordId = ref('')
  const loading = ref(false)

  // 从 PocketBase 加载商店信息
  async function load() {
    if (loading.value) return
    loading.value = true
    try {
      const records = await pb.collection('store_info').getList(1, 1)
      if (records.items.length > 0) {
        const record = records.items[0]
        recordId.value = record.id
        name.value = record.name || ''
        description.value = record.description || ''
        imageUrl.value = record.image || ''
      }
    } catch (error) {
      console.error('加载商店信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 保存到 PocketBase
  async function save() {
    try {
      const data = {
        name: name.value,
        description: description.value,
        image: imageUrl.value
      }

      if (recordId.value) {
        await pb.collection('store_info').update(recordId.value, data)
      } else {
        const record = await pb.collection('store_info').create(data)
        recordId.value = record.id
      }
    } catch (error) {
      console.error('保存商店信息失败:', error)
      throw error
    }
  }

  function reset() {
    name.value = ''
    description.value = ''
    imageUrl.value = ''
    recordId.value = ''
  }

  return {
    name,
    description,
    imageUrl,
    loading,
    load,
    save,
    reset,
  }
})
