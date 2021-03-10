export interface UserType {
  id: number,
  email: string,
  name: string,
  level: number,
  annual: number,
  alternative: number,
  enterDate: string,
  isJoin: boolean
}

export interface LoginPayload {
  email: string,
  password: string
}

export interface LoginResponse {
  access: string,
  refresh: string,
  user: UserType
}

export interface UsersResponse {
  users: UserType[]
}

export interface UserResponse {
  user: UserType
}

export interface MeResponse {
  me: UserType
}

export interface UserChangePasswordPayload {
  currentPassword: string,
  newPassword: string,
  checkNewPassword: string
}

export interface UserCreatePayload {
  name: string,
  email: string,
  slackId: string
}

export interface UserPayload {
  userId: number
}

export interface UserUpdatePayload {
  userId: number,
  annual: number,
  alternative: number,
  enterDate: string,
  isJoin: boolean,
  level: number
}