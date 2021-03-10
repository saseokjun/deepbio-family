import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './App'

import { ApolloProvider } from '@apollo/react-hooks'
import { client } from './apollo/client'
import dotenv from 'dotenv'
import './index.css'
dotenv.config()


ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)
