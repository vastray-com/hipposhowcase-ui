declare namespace Customer {
  type Item = {
    age: number
    // 体检报告 ID 列表
    edmIds: string[] | null
    gender: '女' | '男'
    saleId: string
    saleName: string
    totalConsumption: string | null
    userId: string
    userLevel: string
    userName: string
  }
  type List = Item[]

  type InternalItem = {
    age: number
    gender: '女' | '男'
    sale_id: string
    sale_name: string
    total_consumption: string | null
    user_id: string
    user_level: string
    user_name: string
  }
}
