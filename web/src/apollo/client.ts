import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { JWT, GRAPHQL_ENDPOINT } from './config'
import { LocalUserInitialState, LocalInitialState, SetLocalState } from './store'

import { history } from '../helpers'
import decode from 'jwt-decode'

const cache = new InMemoryCache({
  freezeResults: true,
  addTypename: false,
})

const initialState = {
  ...LocalUserInitialState,
  ...LocalInitialState
}

cache.writeData({ data: initialState })

const opts = {
  credentials: 'include',
}

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  ...opts
})

const authMiddlewareLink = setContext((_, { headers }) => {
  let token = localStorage.getItem(JWT.LOCAL_STORAGE.TOKEN.NAME) || null
  const refreshToken = localStorage.getItem(JWT.LOCAL_STORAGE.REFRESH_TOKEN.NAME) || null
  if (token && refreshToken) {
    let decodedToken: any
    try {
      decodedToken = decode(token)
    } catch (Exception) {
      localStorage.clear()
      history.push('/login')
    }// invalid access token
    const currentTime = Date.now().valueOf() / 1000
    if (currentTime > decodedToken.exp) {
      let decodedRefreshToken: any
      try {
        decodedRefreshToken = decode(refreshToken)
      } catch (Exception) {
        localStorage.clear()
        history.push('/login')
      }// invalid refresh token
      if (currentTime > decodedRefreshToken.exp) {
        localStorage.clear()
        history.push('/login')
      }// access & refresh token expired
      const REFRESH_MUTATION = `
        mutation {
          userRefresh{
            access
          }
        }
      `
      const refreshOpts = {
        method: 'POST',
        headers: {
          authorization: `Bearer ${refreshToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: REFRESH_MUTATION })
      }
      return fetch(GRAPHQL_ENDPOINT, refreshOpts)
        .then(res => {
          return res.json()
        })
        .then(refreshData => {
          const { access } = refreshData.data.userRefresh
          localStorage.setItem(JWT.LOCAL_STORAGE.TOKEN.NAME, access)
          token = access
          console.log('REFRESHED')
          return {
            headers: {
              ...headers,
              authorization: token ? `Bearer ${token}` : '',
            }
          }
        })
        .catch(e => {
          console.log(e)
        })
      // access token expired
    }
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      }
    }
  } else {
    localStorage.clear()
    history.push('/login')
  }
})

const afterwareLink = new ApolloLink((operation, forward) =>
  forward(operation).map(response => {
    const { data } = response
    if (data) {
      const { userLogin } = data
      if (userLogin) {
        const { access, refresh, user } = userLogin
        if (access) {
          localStorage.setItem(JWT.LOCAL_STORAGE.TOKEN.NAME, access)
        }
        if (refresh) {
          localStorage.setItem(JWT.LOCAL_STORAGE.REFRESH_TOKEN.NAME, refresh)
        }
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user))
          cache.writeData({ data: { user } })
        }
      }
    }
    return response
  })
)

const errorLink = onError(({ graphQLErrors, networkError, response, operation }) => {
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      if (error.message.includes('Signature')) {
        localStorage.clear()
        history.push('/login')
      }// invalid signature
      console.error(
        `[GraphQL error]: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`,
        operation,
        response
      )
    }
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`, operation, response)
  }
})

const links = ApolloLink.from([errorLink, afterwareLink, authMiddlewareLink, httpLink])

export const client = new ApolloClient({
  cache,
  link: links,
  connectToDevTools: true,
  queryDeduplication: false,
  assumeImmutableResults: true,
  resolvers: {
    Mutation: {
      ...SetLocalState
    }
    // for cache(local state) mutation
  }
})


