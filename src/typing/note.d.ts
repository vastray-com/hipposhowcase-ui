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
    // 主诉
    chief_complaint: string
    // 现病史
    present_history: string
    //  既往史
    past_history:string
    // 过敏史
    allergy_history: string
    // 个人史
    personal_history: string
    //  家族史
    family_history:string
    // 生育史
    childbearing_history: string
    // 婚姻史
    marriage_history: string
    // 月经史
    menstrual_history: string
    // 体格检查
    physique: string
    // 辅助诊断
    diagnosis: string
    // 复诊计划初步诊断
    plan: string
    // 辅助检查
    examination_advice: string
    // 注意事项
    advice: string
    // 用药或治疗
    medication_treatment_advice: string
    // 饮食与运动
    diet_exercise_advice: string
  }

  type SaleCustomerHistoryParams = {
    sale_id: string
    user_id: string
  }
}
