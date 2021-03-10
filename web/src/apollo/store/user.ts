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
    annual: 0,
    alternative: 0,
    enterDate: '1970-01-01T00:00:00',
    isJoin: true
  }
}

export const GET_LOCAL_USER = gql`
  query getUser {
    user{
      name @client
      email @client
      level @client
      enterDate @client
      isJoin @client
    }
  }
`
