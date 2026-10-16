import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { migrateBrowserStorage } from './storage/migrate-legacy'
import { aliasOf } from './state/site-page'

migrateBrowserStorage()
const alias = aliasOf(new URL(window.location.href))
if (alias) window.history.replaceState(null, '', alias)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
