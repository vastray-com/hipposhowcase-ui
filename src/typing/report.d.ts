declare namespace Report {
  type GetListParams = {
    saleId: string
    userName: string
  }
  type Item = {
    edm_id: string
    edm_age: string
    edm_date: string
    edm_summary: Summary
  }
  type List = Item[]

  type Summary = {
    date_time: string
    summary: string
    anomaly_index: string
    edm_id: string
    recommend: string
  }

  type DetailSection = {
    categoryName: string
    fieldValue: string
    fieldName: string
    unit: string
    range: string
    description: string
  }
  type Detail = {
    edm_id: string
    edm_name: string
    edm_age: string
    edm_gender: string
    edm_date: string
    sections: DetailSection[]
  }
}
