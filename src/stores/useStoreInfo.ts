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
  let pendingImageFile: File | undefined
  let imageDeleted = false

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
        imageUrl.value = record.image ? pb.files.getURL(record, record.image) : ''
      }
    } catch (error) {
      console.error('加载商店信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 设置待上传的图片文件
  function setImageFile(file?: File) {
    pendingImageFile = file
  }

  // 标记图片已删除
  function deleteImage() {
    pendingImageFile = undefined
    imageDeleted = true
    imageUrl.value = ''
  }

  // 保存到 PocketBase
  async function save() {
    try {
      const data: Record<string, unknown> = {
        name: name.value,
        description: description.value,
        user_id: pb.authStore.record?.id || ''
      }

      if (pendingImageFile) {
        data.image = pendingImageFile
      } else if (imageDeleted) {
        data.image = ''
      }
      // 未修改图片则不设置 image 字段，保留原值

      if (recordId.value) {
        await pb.collection('store_info').update(recordId.value, data)
      } else {
        const record = await pb.collection('store_info').create(data)
        recordId.value = record.id
      }

      // 保存成功后重置状态
      pendingImageFile = undefined
      imageDeleted = false
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
    pendingImageFile = undefined
    imageDeleted = false
  }

  return {
    name,
    description,
    imageUrl,
    loading,
    load,
    save,
    reset,
    setImageFile,
    deleteImage,
  }
})
