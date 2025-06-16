declare namespace Project {
  type Info = {
    // 单据编号
    djbh: string
    // 开单日期
    rq: string
    // 开单时间
    ontime: string
    // 开单价格
    huiytj: number
    // 付款金额
    gzmx17: number
    // 项目名称
    xmmch: string
    // 总次数
    times: number
    // 已使用次数
    leaveearly: number
    // 转换次数
    refersCount: number
    // 剩余次数
    times4: number
    // 是否执行
    isZx: string
  }
  type InfoList = Info[]
  type ExecutionInfo = {
    // 单据编号
    djbh: string
    // 执行日期
    rq: string
    // 执行时间
    ontime: string
    // 项目开单价格
    huiytj: number
    // 付款金额
    gzmx17: number
    // 项目名称
    xmmch: string
    // 项目总次数
    times: number
    // 转换次数
    refersCount: number
    // 执行次数
    retries: number
  }
  type ExecutionInfoList = ExecutionInfo[]
  type Data = {
    userBasicProjectInfoPoList: InfoList
    userProjectExecutionInfoPoList: ExecutionInfoList
  }
}
