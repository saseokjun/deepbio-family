import gql from 'graphql-tag'

export const RESTAURANTS = gql`
  query {
    restaurants {
      id
      name
      billType
    }
  }
`