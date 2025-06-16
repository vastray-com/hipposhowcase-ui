import Root from '@/App.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@unocss/reset/normalize.css'
import '@/assets/styles/index.css'
import '@/assets/styles/antd.css'
import 'virtual:uno.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
