export const parseAIInsightContent = ({ content, recommend }: { content?: string | null, recommend?: string | null }): Note.AIContent => {
  try {
    const parsedContent = JSON.parse(content || '{}')
    if (typeof parsedContent !== 'object' || parsedContent === null) {
      console.error('解析内容不是有效的对象')
      return { history: '', diagnosis: '', risk: '', recommend: '', advice: '' }
    } else {
      return { ...parsedContent, recommend: recommend || '' }
    }
  } catch (e) {
    console.error('解析 AI 内容失败:', e)
    return { history: '', diagnosis: '', risk: '', recommend: '', advice: '' }
  }
}
