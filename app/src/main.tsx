import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './Router'

// Theme is now initialised by the inline script in index.html (FOUC prevention)
// and managed by ThemeProvider in Router.tsx. No manual class manipulation here.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
