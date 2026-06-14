<template>
  <!-- 商品编辑页 -->
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar :title="pageTitle">
      <template #left>
        <van-icon name="arrow-left" @click="goBack" />
      </template>
      <template #right>
        <van-button size="small" type="primary" plain @click="onSave">保存</van-button>
      </template>
    </van-nav-bar>

    <van-form class="p-4">
      <!-- 商品条码 -->
      <van-field
        v-model="form.barcode"
        label="商品条码"
        placeholder="请输入商品条码"
        :rules="[{ required: true, message: '请输入商品条码' }]"
      />

      <!-- 商品名称 -->
      <van-field
        v-model="form.name"
        label="商品名称"
        placeholder="请输入商品名称"
        :rules="[{ required: true, message: '请输入商品名称' }]"
      />

      <!-- 价格 -->
      <van-field
        v-model="form.price"
        label="价格"
        placeholder="请输入价格"
        type="number"
        :rules="[{ required: true, message: '请输入价格' }]"
      />

      <!-- 单位 -->
      <van-field
        v-model="form.unit"
        label="单位"
        placeholder="如：包/瓶/盒"
        :rules="[{ required: true, message: '请输入单位' }]"
      />

      <!-- 分类 -->
      <van-field
        v-model="form.category"
        label="分类"
        placeholder="如：食品/饮料/日用品"
      />

      <!-- 商品图片 -->
      <van-field label="商品图片">
        <template #input>
          <van-uploader
            v-model="fileList"
            :max-count="1"
            :after-read="afterRead"
            @delete="onDeleteImage"
          />
        </template>
      </van-field>
    </van-form>

    <!-- 删除按钮（仅编辑模式显示） -->
    <div v-if="isEditing" class="p-4 mt-4">
      <van-button block type="danger" @click="onDelete">删除商品</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showConfirmDialog, type UploaderFileListItem } from 'vant'
import pb from '../api/pocketbase'
import type { Product } from '../types'

const router = useRouter()
const route = useRoute()

const form = ref({
  barcode: '',
  name: '',
  price: 0,
  unit: '',
  category: '',
  image: ''
})

const fileList = ref<UploaderFileListItem[]>([])
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref('')
let pendingImageFile: File | undefined
let imageDeleted = false

const pageTitle = computed(() => form.value.name || '商品信息')

onMounted(() => {
  const productStr = route.query.product as string | undefined
  if (productStr) {
    try {
      const product = JSON.parse(productStr) as Product
      isEditing.value = true
      editingId.value = product.id
      form.value = {
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        unit: product.unit,
        category: product.category || '',
        image: product.image || ''
      }
      if (product.image) {
        fileList.value = [{ url: product.image }]
      }
    } catch {
      // 忽略解析错误
    }
  } else {
    // 检查是否携带条码参数（从扫描页跳转）
    const barcode = route.query.barcode as string | undefined
    if (barcode) {
      form.value.barcode = barcode
    }
  }
})

const afterRead = (file: UploaderFileListItem | UploaderFileListItem[]) => {
  const item = Array.isArray(file) ? file[0] : file
  if (item.file) {
    pendingImageFile = item.file
  }
}

const onDeleteImage = () => {
  pendingImageFile = undefined
  imageDeleted = true
}

const onSave = async () => {
  if (!form.value.barcode.trim()) {
    showToast('请输入商品条码')
    return
  }
  if (!form.value.name.trim()) {
    showToast('请输入商品名称')
    return
  }
  if (!form.value.unit.trim()) {
    showToast('请输入单位')
    return
  }
  if (form.value.price <= 0) {
    showToast('请输入有效价格')
    return
  }
  if (saving.value) return

  saving.value = true
  showLoadingToast({ message: '保存中...', forbidClick: true })

  try {
    const body: Record<string, unknown> = {
      barcode: form.value.barcode,
      name: form.value.name,
      price: form.value.price,
      unit: form.value.unit,
      category: form.value.category,
      user_id: pb.authStore.record?.id || ''
    }

    if (pendingImageFile) {
      body.image = pendingImageFile
    } else if (imageDeleted) {
      body.image = ''
    }

    if (isEditing.value) {
      await pb.collection('products').update(editingId.value, body)
    } else {
      await pb.collection('products').create(body)
    }

    showToast('保存成功')
    router.back()
  } catch (error) {
    const err = error as Error
    showToast(err.message || '保存失败，请重试')
  } finally {
    saving.value = false
    closeToast()
  }
}

const goBack = () => {
  router.back()
}

const onDelete = async () => {
  try {
    await showConfirmDialog({
      message: `确定删除 ${form.value.name} 吗？`
    })
    await pb.collection('products').delete(editingId.value)
    showToast('删除成功')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      const err = error as Error
      showToast(err.message || '删除失败')
    }
  }
}
</script>
