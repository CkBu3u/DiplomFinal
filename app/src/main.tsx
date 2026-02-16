import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:2rem;font-family:sans-serif;">No root element</div>'
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (e) {
    console.error('Failed to mount app:', e)
    rootEl.innerHTML = '<div style="padding:2rem;font-family:sans-serif;">Failed to load app. Check console.</div>'
  }
}
