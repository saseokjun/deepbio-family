import gql from 'graphql-tag'

export interface SnackbarInterface {
  isOpen: boolean,
  message: String,
  severity: 'success' | 'info' | 'warning' | 'error'
}

export interface LocalStateInterface {
  snackbar: SnackbarInterface,
}

export const LocalInitialState: LocalStateInterface = {
  snackbar: {
    isOpen: false,
    message: '',
    severity: 'info'
  },
}

export const GET_LOCAL_STATE = gql`
  query getLocalState {
    snackbar {
      isOpen @client
      message @client
      severity @client
    }
  }
`

export const SetLocalState = {
  setLocalState: (_: any, variables: SnackbarInterface, { cache }: any) => {
    cache.writeData({
      data: {
        snackbar: {
          isOpen: variables.isOpen,
          message: variables.message,
          severity: variables.severity
        }
      }
    })
    return null
  }
}

export const SET_LOCAL_STATE = gql`
  mutation setLocalState(
    $isOpen: Boolean,
    $message: String,
    $severity: String
  ){
    setLocalState (
      isOpen: $isOpen,
      message: $message,
      severity: $severity
    ) @client
  }
`