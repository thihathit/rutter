import 'urlpattern-polyfill'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

const nodeRef = document.getElementById('app')!

ReactDOM.createRoot(nodeRef).render(
  <StrictMode>
    <App />
  </StrictMode>
)
