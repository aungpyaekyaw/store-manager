import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { IntlProvider } from 'react-intl'
import './index.css'
import App from './App.tsx'
import { defaultLocale, messages } from './i18n/config'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IntlProvider messages={messages[defaultLocale]} locale={defaultLocale}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </IntlProvider>
  </React.StrictMode>,
)
