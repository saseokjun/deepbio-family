import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks'
import { USERS, USER } from '../graphql/queries'
import { USER_RESET_PASSWORD, USER_UPDATE } from '../graphql/mutations'
import { UserType, UsersResponse, UserResponse, UserPayload, UserUpdatePayload } from '../interfaces'
import { SET_LOCAL_STATE, SnackbarInterface } from '../apollo/store'
import { Account, Layout } from '../components'
import { formatDate } from '../utils'

interface Props { }

export const AccountContainer: React.FC<Props> = () => {
  const [isModal, setIsModal] = useState<boolean>(false)
  const [updateUserState, setUpdateUserState] = useState<UserUpdatePayload>({
    userId: 0, annual: 0, alternative: 0, enterDate: '', isJoin: true, level: 0
  })

  const [userFetch, { data: userData }] = useLazyQuery<UserResponse, UserPayload>(USER, {
    fetchPolicy: 'network-only'
  })
  const { data: usersData, refetch: usersRefetch } = useQuery<UsersResponse>(USERS)
  const [userUpdate] = useMutation<UserType, UserUpdatePayload>(USER_UPDATE)
  const [userResetPassword] = useMutation<{}, UserPayload>(USER_RESET_PASSWORD)
  const [setLocalState] = useMutation<SnackbarInterface>(SET_LOCAL_STATE)

  useEffect(() => {
    if (userData) {
      const { id, annual, alternative, enterDate, isJoin, level } = userData.user
      const eDate = formatDate(new Date(enterDate))
      setUpdateUserState({ userId: id, annual, alternative, enterDate: eDate, isJoin, level })
      setIsModal(true)
    }
  }, [userData])

  const handleFetchUserState = (userId: number) => {
    userFetch({ variables: { userId } })
  }

  const handleResetPassword = (userId: number) => {
    let message: string, severity: string
    userResetPassword({ variables: { userId } }).then(() => {
      message = '비밀번호가 초기화 되었습니다.'
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

  const handleUpdateUserState = (name: string, value: any) => {
    setUpdateUserState(prev => ({ ...prev, [name]: value }))
  }

  const handleModalClose = () => {
    setIsModal(false)
  }

  const handleModalConfirm = () => {
    userUpdate({ variables: updateUserState }).then(() => {
      setIsModal(false)
      usersRefetch()
    }).catch(err => {
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
    <Layout content={
      <Account
        usersData={usersData}
        isModal={isModal}
        handleModalClose={handleModalClose}
        handleModalConfirm={handleModalConfirm}
        updateUserState={updateUserState}
        handleFetchUserState={handleFetchUserState}
        handleUpdateUserState={handleUpdateUserState}
        handleResetPassword={handleResetPassword}
      />
    } />
  </React.Fragment>
}