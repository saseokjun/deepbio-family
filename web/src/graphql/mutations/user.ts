import gql from 'graphql-tag'

export const USER_LOGIN = gql`
  mutation userLogin(
    $email: String!,
    $password: String!
  ){
    userLogin(
      email: $email,
      password: $password
    ){
      access
      refresh
      user{
        id
        email
        name
        level
      }
    }
}`

export const USER_CHANGE_PASSWORD = gql`
  mutation userChangePassword(
    $currentPassword: String!,
    $newPassword: String!,
    $checkNewPassword: String!
  ){
    userChangePassword(
      currentPassword: $currentPassword,
      newPassword: $newPassword,
      checkNewPassword: $checkNewPassword
    ){
      response
    }
  }
`

export const USER_CREATE = gql`
  mutation userCreate(
    $name: String!,
    $email: String!,
    $slackId: String!
  ){
    userCreate(
      name: $name,
      email: $email,
    ){
      user{
        id
      }
    }
  }
`
