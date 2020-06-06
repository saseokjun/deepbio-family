import gql from 'graphql-tag'
import { UserType } from '../../interfaces'

export interface LocalUserInterface {
  user: UserType
}

export const LocalUserInitialState: LocalUserInterface = {
  user: {
    id: 0,
    name: '',
    email: '',
    level: 0,
  }
}

export const GET_LOCAL_USER = gql`
  query getUser {
    user{
      name @client
      email @client
      level @client
    }
  }
`
