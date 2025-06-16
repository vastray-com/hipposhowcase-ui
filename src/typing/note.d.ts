declare namespace Note {
  type CreateParams = {
    title: string
    sale_id: string
    patient_id: string
    patient_info: Customer.InternalItem
    sentences: any[]
  }
  type PartialUpdateParams = {
    title?: string
    id: string
  }

  type Word = {
    begin_time: number
    end_time: number
    word: string
  }
  type Words = Word[]
  type Sentence = {
    begin_time: number
    content: string
    end_time: number
    is_sent: boolean
    role_id: string
    words: Words
  }
  type Sentences = Sentence[]

  type Item = {
    id: {
      tb: 'medical_record'
      id: {
        String: string
      }
    }
    sale_id: string
    patient_id: string
    title: string
    patient_info: Customer.InternalItem
    visit_id: string | null
    recording_file: string | null
    recording_transcribe: string | null
    content: string | null
    diagnosis: string | null
    recommendation: string | null
    sentences: Sentences
    recommend: string | null
    created_at: string | null
    summary?: string | null
  }
  type List = Item[]
  type ListRes = {
    data: List
    page: number
    page_size: number
    total: number
  }
  type ListParams = {
    sale_id: string
    page: number
    page_size: number
    keyword?: string
  }

  type AIContent = {
    // 病史情况
    history?: string
    // 诊断推荐
    diagnosis?: string
    // 疾病风险
    risk?: string
    // 健康建议
    advice?: string
    // 产品推荐
    recommend?: string
  }

  type SaleCustomerHistoryParams = {
    sale_id: string
    user_id: string
  }
}
