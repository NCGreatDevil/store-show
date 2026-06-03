/**
 * 用户信息管理 Composable
 * 
 * Composable 是 Vue 3 的组合式 API，用于封装和复用有状态的逻辑
 * 这个 composable 封装了用户信息的 CRUD 操作（增删改查）
 * 
 * 优点：
 * 1. 逻辑复用：可以在多个组件中使用相同的逻辑
 * 2. 代码组织：将相关逻辑集中在一起，便于维护
 * 3. 类型安全：使用 TypeScript 提供完整的类型支持
 */

import { ref, reactive } from 'vue'
import pb from '../api/pocketbase'
import type { UserProfile, UserProfileForm, PocketBaseError } from '../types'

/**
 * 用户信息管理 Composable
 * @returns 返回用户信息相关的状态和方法
 */
export function useUserProfile() {
  // ==================== 状态定义 ====================
  
  /**
   * 用户信息列表
   * 使用 ref 包装数组，使其成为响应式
   */
  const list = ref<UserProfile[]>([])
  
  /**
   * 加载状态
   * 用于控制列表的加载指示器
   */
  const loading = ref(false)
  
  /**
   * 加载完成状态
   * 当所有数据加载完成后设置为 true
   */
  const finished = ref(false)
  
  /**
   * 刷新状态
   * 用于控制下拉刷新指示器
   */
  const refreshing = ref(false)
  
  /**
   * 加载锁
   * 防止重复加载（使用普通变量，不需要响应式）
   */
  let loadingLock = false
  
  /**
   * 对话框显示状态
   * 控制新增/编辑对话框的显示
   */
  const showDialog = ref(false)
  
  /**
   * 编辑模式标志
   * true: 编辑现有记录
   * false: 新增新记录
   */
  const isEditing = ref(false)
  
  /**
   * 正在编辑的记录 ID
   * 编辑模式下使用
   */
  const editingId = ref('')
  
  /**
   * 表单默认值
   * 用于初始化和重置表单
   */
  const defaultForm: UserProfileForm = {
    username: '',
    age: undefined,
    occupation: '',
    phone: '',
    bio: ''
  }
  
  /**
   * 表单数据
   * 使用 reactive 包装对象，使其所有属性都成为响应式
   */
  const form = reactive<UserProfileForm>({ ...defaultForm })
  
  // ==================== PocketBase 集合 ====================
  
  /**
   * PocketBase 集合实例
   * 用于操作 user_profiles 集合
   */
  const collection = pb.collection('user_profiles')
  
  // ==================== 数据操作方法 ====================
  
  /**
   * 加载用户信息列表
   * 从 PocketBase 获取当前登录用户的数据
   */
  const loadList = async (): Promise<void> => {
    // 检查是否正在加载或已加载完成
    if (loadingLock || finished.value) return
    
    // 设置加载锁，防止重复加载
    loadingLock = true
    
    try {
      // 从 PocketBase 获取当前用户的完整列表（最多 500 条记录）
      // filter: 只返回当前登录用户的数据
      // sort: '-created' 表示按创建时间倒序排列
      const result = await collection.getFullList(500, {
        filter: `user_id = '${pb.authStore.record?.id}'`,
        sort: '-created'
      })
      
      // 将结果转换为 UserProfile 类型并赋值
      list.value = result as unknown as UserProfile[]
      
      // 标记加载完成
      finished.value = true
    } catch (error) {
      // 处理错误
      const err = error as PocketBaseError
      throw new Error(err.message || '加载失败')
    } finally {
      // 无论成功或失败，都重置加载状态
      loading.value = false
      refreshing.value = false
      loadingLock = false
    }
  }
  
  /**
   * 刷新列表
   * 重置状态并重新加载数据
   */
  const refreshList = (): void => {
    finished.value = false
    loading.value = true
    loadingLock = false
    loadList()
  }
  
  /**
   * 创建新用户信息
   * @param data - 用户信息表单数据
   */
  const createUserProfile = async (data: UserProfileForm): Promise<void> => {
    try {
      // 构建请求体，添加用户 ID
      const body = {
        ...data,
        user_id: pb.authStore.record?.id || ''
      }
      
      // 调用 PocketBase 创建记录
      await collection.create(body)
    } catch (error) {
      const err = error as PocketBaseError
      throw new Error(err.message || '创建失败')
    }
  }
  
  /**
   * 更新用户信息
   * @param id - 记录 ID
   * @param data - 用户信息表单数据
   */
  const updateUserProfile = async (id: string, data: UserProfileForm): Promise<void> => {
    try {
      // 构建请求体，添加用户 ID
      const body = {
        ...data,
        user_id: pb.authStore.record?.id || ''
      }
      
      // 调用 PocketBase 更新记录
      await collection.update(id, body)
    } catch (error) {
      const err = error as PocketBaseError
      throw new Error(err.message || '更新失败')
    }
  }
  
  /**
   * 删除用户信息
   * @param id - 记录 ID
   */
  const deleteUserProfile = async (id: string): Promise<void> => {
    try {
      // 调用 PocketBase 删除记录
      await collection.delete(id)
    } catch (error) {
      const err = error as PocketBaseError
      throw new Error(err.message || '删除失败')
    }
  }
  
  // ==================== 表单操作方法 ====================
  
  /**
   * 显示新增表单
   * 重置表单并打开对话框
   */
  const showAddForm = (): void => {
    isEditing.value = false
    editingId.value = ''
    resetForm()
    showDialog.value = true
  }
  
  /**
   * 显示编辑表单
   * @param item - 要编辑的用户信息
   */
  const showEditForm = (item: UserProfile): void => {
    isEditing.value = true
    editingId.value = item.id
    
    // 将数据填充到表单
    form.username = item.username
    form.age = item.age
    form.occupation = item.occupation || ''
    form.phone = item.phone || ''
    form.bio = item.bio || ''
    
    showDialog.value = true
  }
  
  /**
   * 重置表单
   * 将表单恢复到默认值
   */
  const resetForm = (): void => {
    Object.assign(form, defaultForm)
  }
  
  /**
   * 保存表单
   * 根据编辑模式决定是创建还是更新
   */
  const saveForm = async (): Promise<void> => {
    // 验证必填字段
    if (!form.username.trim()) {
      throw new Error('请输入用户名')
    }
    
    try {
      if (isEditing.value) {
        // 编辑模式：更新现有记录
        await updateUserProfile(editingId.value, form)
      } else {
        // 新增模式：创建新记录
        await createUserProfile(form)
      }
      
      // 关闭对话框并重置表单
      showDialog.value = false
      resetForm()
      
      // 刷新列表
      refreshList()
    } catch (error) {
      // 抛出错误，让调用者处理
      throw error
    }
  }
  
  // ==================== 返回状态和方法 ====================
  
  /**
   * 返回所有状态和方法
   * 组件可以使用这些来构建用户界面
   */
  return {
    // 状态
    list,
    loading,
    finished,
    refreshing,
    showDialog,
    isEditing,
    form,
    
    // 方法
    loadList,
    refreshList,
    createUserProfile,
    updateUserProfile,
    deleteUserProfile,
    showAddForm,
    showEditForm,
    resetForm,
    saveForm
  }
}