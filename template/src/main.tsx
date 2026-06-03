import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'matcha-oat-design-system/tokens.css'
import 'matcha-oat-design-system/fonts.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
