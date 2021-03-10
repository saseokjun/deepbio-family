import gql from 'graphql-tag'

export const ACCESS = gql`
  query (
    $startDate: Date!,
    $endDate: Date!,
    $userId: Int
  ){
    access(
      startDate: $startDate,
      endDate: $endDate,
      userId: $userId
    ){
      timestamp
      accessType
    }
  }
`

export const LAST_ACCESS = gql`
  query{
    lastAccess{
      timestamp
      accessType
    }
  }
`