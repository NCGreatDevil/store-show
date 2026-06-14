/**
 * 商品管理 Composable
 * 封装商品的 CRUD 操作（增删改查）
 */

import { ref, reactive } from 'vue'
import pb from '../api/pocketbase'
import type { Product, ProductForm, PocketBaseError } from '../types'

export function useProduct() {
  // ==================== 状态定义 ====================

  const list = ref<Product[]>([])
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)
  let loadingLock = false

  const showDialog = ref(false)
  const isEditing = ref(false)
  const editingId = ref('')

  const defaultForm: ProductForm = {
    barcode: '',
    name: '',
    price: 0,
    unit: '',
    category: '',
    image: ''
  }

  const form = reactive<ProductForm & { _imageFile?: File }>({ ...defaultForm })

  // ==================== PocketBase 集合 ====================

  const collection = pb.collection('products')

  // ==================== 数据操作方法 ====================

  const loadList = async (): Promise<void> => {
    if (loadingLock || finished.value) return
    loadingLock = true

    try {
      const result = await collection.getFullList(500, {
        sort: '-created'
      })
      list.value = result.map((item: any) => ({
        ...item,
        image: item.image ? pb.files.getURL(item, item.image) : ''
      })) as unknown as Product[]
      finished.value = true
    } catch (error) {
      const err = error as PocketBaseError
      throw new Error(err.message || '加载失败')
    } finally {
      loading.value = false
      refreshing.value = false
      loadingLock = false
    }
  }

  const refreshList = (): void => {
    finished.value = false
    loading.value = true
    loadingLock = false
    loadList()
  }

  const createProduct = async (data: Record<string, unknown>): Promise<void> => {
    try {
      await collection.create(data)
    } catch (error) {
      const err = error as PocketBaseError
      throw new Error(err.message || '创建失败')
    }
  }

  const updateProduct = async (id: string, data: Record<string, unknown>): Promise<void> => {
    try {
      await collection.update(id, data)
    } catch (error) {
      const err = error as PocketBaseError
      throw new Error(err.message || '更新失败')
    }
  }

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await collection.delete(id)
    } catch (error) {
      const err = error as PocketBaseError
      throw new Error(err.message || '删除失败')
    }
  }

  // ==================== 表单操作方法 ====================

  const showAddForm = (): void => {
    isEditing.value = false
    editingId.value = ''
    resetForm()
    showDialog.value = true
  }

  const showEditForm = (item: Product): void => {
    isEditing.value = true
    editingId.value = item.id
    form.barcode = item.barcode
    form.name = item.name
    form.price = item.price
    form.unit = item.unit
    form.category = item.category || ''
    form.image = item.image || ''
    // 如果有图片，设置上传组件的预览
    showDialog.value = true
  }

  const resetForm = (): void => {
    Object.assign(form, defaultForm)
  }

  const saveForm = async (imageFile?: File, imageDeleted?: boolean): Promise<void> => {
    if (!form.barcode.trim()) {
      throw new Error('请输入商品条码')
    }
    if (!form.name.trim()) {
      throw new Error('请输入商品名称')
    }
    if (!form.unit.trim()) {
      throw new Error('请输入计量单位')
    }
    if (form.price <= 0) {
      throw new Error('请输入有效价格')
    }

    try {
      const body: Record<string, unknown> = {
        barcode: form.barcode,
        name: form.name,
        price: form.price,
        unit: form.unit,
        category: form.category,
        user_id: pb.authStore.record?.id || ''
      }

      if (imageFile) {
        body.image = imageFile
      } else if (imageDeleted) {
        body.image = ''
      }
      // 如果既没有新文件也没有删除，不设置 image 字段，PocketBase 会保留原值

      if (isEditing.value) {
        await updateProduct(editingId.value, body)
      } else {
        await createProduct(body)
      }
      showDialog.value = false
      resetForm()
      refreshList()
    } catch (error) {
      throw error
    }
  }

  // ==================== 返回状态和方法 ====================

  return {
    list,
    loading,
    finished,
    refreshing,
    showDialog,
    isEditing,
    form,
    loadList,
    refreshList,
    createProduct,
    updateProduct,
    deleteProduct,
    showAddForm,
    showEditForm,
    resetForm,
    saveForm
  }
}
