<template>
  <!-- 商店编辑页 -->
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
      <!-- 商店名称 -->
      <van-field
        v-model="storeName"
        label="商店名称"
        placeholder="请输入商店名称"
        :rules="[{ required: true, message: '请输入商店名称' }]"
      />

      <!-- 商店描述 -->
      <van-field
        v-model="storeDesc"
        label="商店描述"
        type="textarea"
        placeholder="请输入商店描述"
        rows="3"
        autosize
      />



      <!-- 商店图片 -->
      <van-field label="商店图片">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, type UploaderFileListItem } from 'vant'
import { useStoreInfo } from '../stores/useStoreInfo'

const router = useRouter()
const storeInfo = useStoreInfo()

const storeName = ref('')
const storeDesc = ref('')
const fileList = ref<UploaderFileListItem[]>([])
const saving = ref(false)

const pageTitle = computed(() => storeName.value || '商店信息')

onMounted(async () => {
  await storeInfo.load()
  storeName.value = storeInfo.name
  storeDesc.value = storeInfo.description
  if (storeInfo.imageUrl) {
    fileList.value = [{ url: storeInfo.imageUrl }]
  }
})

const afterRead = (file: UploaderFileListItem | UploaderFileListItem[]) => {
  const item = Array.isArray(file) ? file[0] : file
  if (item.file) {
    storeInfo.setImageFile(item.file)
  }
}

const onDeleteImage = () => {
  storeInfo.deleteImage()
}

const onSave = async () => {
  if (!storeName.value.trim()) {
    showToast('请输入商店名称')
    return
  }
  if (saving.value) return

  saving.value = true
  showLoadingToast({ message: '保存中...', forbidClick: true })

  try {
    storeInfo.name = storeName.value
    storeInfo.description = storeDesc.value
    await storeInfo.save()
    showToast('保存成功')
    router.back()
  } catch {
    showToast('保存失败，请重试')
  } finally {
    saving.value = false
    closeToast()
  }
}

const goBack = () => {
  router.back()
}
</script>
