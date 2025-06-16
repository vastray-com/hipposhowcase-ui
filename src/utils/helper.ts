const initialAIContent: Note.AIContent = {
  chief_complaint: '',
  present_history: '',
  past_history: '',
  allergy_history: '',
  personal_history: '',
  family_history: '',
  childbearing_history: '',
  marriage_history: '',
  menstrual_history: '',
  physique: '',
  diagnosis: '',
  plan: '',
  examination_advice: '',
  advice: '',
  medication_treatment_advice: '',
  diet_exercise_advice: '',
};

export const medicalRecordItems:{key:keyof Note.AIContent ,label:string}[] = [
  {key:'chief_complaint', label: '主诉'},
  {key:'present_history', label: '现病史'},
  {key:'past_history', label: '既往史'},
  {key:'allergy_history', label: '过敏史'},
  {key:'personal_history', label: '个人史'},
  {key:'family_history', label: '家族史'},
  {key:'childbearing_history', label: '生育史'},
  {key:'marriage_history', label: '婚姻史'},
  {key:'menstrual_history', label: '月经史'},
  {key:'physique', label: '体格检查'},
  {key:'diagnosis', label: '辅助诊断'},
  {key:'plan', label: '复诊计划初步诊断'},
  {key:'examination_advice', label: '辅助检查'},
  {key:'advice', label: '注意事项'},
  {key:'medication_treatment_advice', label: '用药或治疗'},
  {key:'diet_exercise_advice', label: '饮食与运动'},

]

export const parseAIInsightContent = ({content, recommend}: {
  content?: string | null,
  recommend?: string | null
}): Note.AIContent => {
  try {
    const parsedContent = JSON.parse(content || '{}');
    if (typeof parsedContent !== 'object' || parsedContent === null) {
      console.error('解析内容不是有效的对象');
      return {...initialAIContent};
    } else {
      return {...parsedContent, recommend: recommend || ''};
    }
  } catch (e) {
    console.error('解析 AI 内容失败:', e);
    return {...initialAIContent};
  }
};
