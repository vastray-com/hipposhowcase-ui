import service from '@/utils/service'

const login = {
  // 登录
  loginWithCode: async (data: Login.LoginWithCodeParams): Promise<API.Response<Login.LoginWithCodeResponse>> => service.post('/api/login/login_with_code', data),
  // 发送验证码
  sendCode: async (data: Login.SendCodeParams): Promise<API.Response<Login.SendCodeResponse>> => service.post('/api/login/request_verification', data),
}

const customer = {
  // 查询客户
  search: async (sale_id: string, keyword: string): Promise<API.Response<Customer.List>> => service.get(`/api/user/info`, {
    params: {
      saleId: sale_id,
      userName: keyword,
      page: 1,
      pageSize: 1000,
    },
  }),
}

const report = {
  // 获取体检报告列表
  getList: async (params: Report.GetListParams): Promise<API.Response<Report.List>> => service.get(`/api/reports/physical_examination_report_list`, { params }),
  // 获取体检报告总结
  getSummary: async (edmId: string): Promise<API.Response<Report.Summary>> => service.get(`/api/reports/physical_examination_report_summary`, {
    params: { edmId },
  }),
  // 获取体检报告明细
  getDetail: async (edmId: string): Promise<API.Response<Report.Detail>> => service.get(`/api/reports/physical_examination_report`, {
    params: { edmId },
  }),
}

const project = {
  getList: async (userId: string): Promise<API.Response<Project.Data>> => service.get(`/api/customers/plans`, { params: { user_id: userId } }),
}

const note = {
  create: async (params: Note.CreateParams): Promise<API.Response<Note.Item>> => service.post(`/api/medical_records/create`, params),
  update: async (params: Note.PartialUpdateParams): Promise<API.Response<Note.Item>> => service.post(`/api/medical_records/partial_update`, params),
  getList: async (params: Note.ListParams): Promise<API.Response<Note.ListRes>> => service.get(`/api/medical_records/list`, { params }),
  getDetail: async (id: string): Promise<API.Response<Note.Item>> => service.get(`/api/medical_records/detail`, { params: { id } }),
  getSaleCustomerHistory: async (params: Note.SaleCustomerHistoryParams): Promise<API.Response<Note.List>> => service.get(`/api/medical_records/user`, { params }),
}

export const api = {
  login,
  customer,
  report,
  project,
  note,
}
