import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { USER_CREATE } from '../graphql/mutations'
import { UserType, UserCreatePayload } from '../interfaces'
import { SET_LOCAL_STATE, SnackbarInterface } from '../apollo/store'
import { Layout } from '../components'
import Register from '../components/Register/Register'
import { slackAPI } from '../utils'

interface Props { }

export const RegisterContainer: React.FC<Props> = () => {
  const [createUserState, setCreateUserState] = useState<UserCreatePayload>({ name: '', email: '', slackId: '' })
  const [userCreate] = useMutation<UserType, UserCreatePayload>(USER_CREATE)

  const [setLocalState] = useMutation<SnackbarInterface>(SET_LOCAL_STATE)

  const handleCreateUserState = (name: string, value: string) => {
    setCreateUserState(prev => ({ ...prev, [name]: value }))
  }

  const handleUserCreate = () => {
    let message: string, severity: string
    userCreate({ variables: createUserState }).then(() => {
      message = '계정이 생성되었습니다.'
      severity = 'success'
    }).catch(err => {
      message = err.graphQLErrors[0].message
      severity = 'error'
    }).finally(() => {
      setLocalState({
        variables: {
          isOpen: true,
          message,
          severity
        }
      })
    })
  }

  const findSlackId = (username: string) => {
    slackAPI(username).then((res) => {
      const { id } = res.data
      handleCreateUserState('slackId', id)
    }).catch((err) => {
      setLocalState({
        variables: {
          isOpen: true,
          message: 'Network error. Please contact system administrator.',
          severity: 'error'
        }
      })
    })
  }


  return <React.Fragment>
    <Layout content={
      <Register
        createUserState={createUserState}
        handleCreateUserState={handleCreateUserState}
        handleUserCreate={handleUserCreate}
        findSlackId={findSlackId}
      />
    } />
  </React.Fragment>
}