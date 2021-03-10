import React, { useState, useEffect } from 'react'
import { USER_LOGIN } from '../graphql/mutations'
import { useMutation } from '@apollo/react-hooks'
import { SET_LOCAL_STATE, SnackbarInterface } from '../apollo/store'
import { Login } from '../components'
import { history } from '../helpers'
import { LoginPayload } from '../interfaces'

interface Props { }

export const LoginContainer: React.FC<Props> = () => {
  const [loginState, setLoginState] = useState<LoginPayload>({
    email: '',
    password: ''
  })
  const [login, { data }] = useMutation<LoginPayload>(USER_LOGIN, {
    variables: loginState
  })
  const [setLocalState] = useMutation<SnackbarInterface>(SET_LOCAL_STATE)

  const handleLoginState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement
    setLoginState(prevState => ({ ...prevState, [name]: value }))
  }

  useEffect(() => {
    if (data) {
      history.push('/')
    }
  }, [data])

  const handleLogin = () => {
    login().catch(err => {
      setLocalState({
        variables: {
          isOpen: true,
          message: err.graphQLErrors[0].message,
          severity: 'error'
        }
      })
    })
  }

  return <React.Fragment>
    <Login
      loginState={loginState}
      handleLoginState={handleLoginState}
      handleLogin={handleLogin}
    />
  </React.Fragment>
}