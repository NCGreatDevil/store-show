/**
 * 商店信息管理 Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'store_info'

export const useStoreInfo = defineStore('storeInfo', () => {
  const name = ref('')
  const description = ref('')
  const imageUrl = ref('')

  function load() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      name.value = data.name || ''
      description.value = data.description || ''
      imageUrl.value = data.imageUrl || ''
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name: name.value,
      description: description.value,
    }))
  }

  function reset() {
    name.value = ''
    description.value = ''
    imageUrl.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  // 初始化时加载
  load()

  return {
    name,
    description,
    imageUrl,
    save,
    reset,
  }
})
