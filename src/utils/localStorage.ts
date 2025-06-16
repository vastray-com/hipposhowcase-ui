export type LocalstorageSchema = {
  // Access Token
  at: string | null
  // 销售信息
  sale: {
    name: string
    id: string
  } | null
}

export const LS_KEY = {
  ACCESS_TOKEN: 'at',
  SALE: 'sale',
} as const

export const ls = {
  // 获取一个键值对
  get: <T extends keyof LocalstorageSchema>(key: T): LocalstorageSchema[T] => {
    const value = localStorage.getItem(key)
    if (value === null) return null
    if (typeof value === 'undefined') return null
    try {
      return JSON.parse(value) as LocalstorageSchema[T]
    } catch (e) {
      return value as LocalstorageSchema[T]
    }
  },
  // 设置一个键值对
  set: <T extends keyof LocalstorageSchema>(key: T, value: LocalstorageSchema[T]) => {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value))
    } else {
      localStorage.setItem(key, value)
    }
  },
  // 删除一个键值对
  rm: (key: string) => localStorage.removeItem(key),
  // 清空所有键值对
  clear: () => localStorage.clear(),
}
