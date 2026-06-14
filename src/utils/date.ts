/**
 * 日期时间格式化工具
 * 
 * 数据库存储 UTC 时间，前端显示时转换为北京时间（+8 小时）
 */

/**
 * 将 UTC 时间字符串格式化为本地时间字符串（北京时间）
 * @param utcString - UTC 时间字符串（ISO 8601 格式）
 * @returns 格式化后的北京时间字符串，如 "2026/6/14 11:10:00"
 */
export function formatDateTime(utcString: string): string {
  return new Date(utcString).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

/**
 * 将 UTC 时间字符串格式化为日期字符串
 * @param utcString - UTC 时间字符串（ISO 8601 格式）
 * @returns 格式化后的日期字符串，如 "2026/6/14"
 */
export function formatDate(utcString: string): string {
  return new Date(utcString).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

/**
 * 将 UTC 时间字符串格式化为时间字符串
 * @param utcString - UTC 时间字符串（ISO 8601 格式）
 * @returns 格式化后的时间字符串，如 "11:10:00"
 */
export function formatTime(utcString: string): string {
  return new Date(utcString).toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai' })
}
