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
        annual
        alternative
        enterDate
        isJoin
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
      slackId: $slackId,
    ){
      user{
        id
      }
    }
  }
`

export const USER_RESET_PASSWORD = gql`
  mutation userResetPassword(
    $userId: Int!
  ){
    userResetPassword(
      userId: $userId
    ){
      response
    }
  }
`

export const USER_UPDATE = gql`
  mutation userUpdate(
    $userId: Int!,
    $annual: Float,
    $alternative: Float,
    $enterDate: Date,
    $isJoin: Boolean,
    $level: Int
  ){
    userUpdate(
      userId: $userId,
      annual: $annual,
      alternative: $alternative,
      enterDate: $enterDate,
      isJoin: $isJoin,
      level: $level,
    ){
      user{
        id
      }
    }
  }
`