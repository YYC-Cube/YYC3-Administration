import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app/App'
import { initErrorReporting } from '@/lib/error-monitor'
import '@/styles/index.css'

// 错误监控（F-14）：VITE_SENTRY_DSN 未配置时为 no-op，fire-and-forget 不阻塞渲染
void initErrorReporting()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
