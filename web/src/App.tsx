import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { GET_LOCAL_STATE, LocalStateInterface } from './apollo/store/base'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { Router, Route, Switch } from 'react-router-dom'
import { AccessContainer, HolidayContainer, LoginContainer, MealContainer, RegisterContainer, AccountContainer } from './containers'
import { ProtectedRoute, AdminPageRoute } from './components'
import { history } from './helpers'
import './App.css'

export const App: React.FC = () => {
  const { data: localStateData, client } = useQuery<LocalStateInterface>(GET_LOCAL_STATE)
  const handleSnackbarClose = (e?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    client.writeData({
      data: {
        snackbar: {
          isOpen: false
        }
      }
    })
  }

  return (
    <React.Fragment>
      <Router history={history}>
        <Switch>
          <ProtectedRoute exact path='/' component={AccessContainer} />
          <ProtectedRoute exact path='/holiday' component={HolidayContainer} />
          <ProtectedRoute exact path='/meal' component={MealContainer} />
          <AdminPageRoute exact path='/register' component={RegisterContainer} />
          <AdminPageRoute exact path='/account' component={AccountContainer} />
          <Route path='/login' component={LoginContainer} />
        </Switch>
      </Router>
      {localStateData &&
        <Snackbar open={localStateData.snackbar.isOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
          <Alert severity={localStateData.snackbar.severity} onClose={handleSnackbarClose}>
            {localStateData.snackbar.message}
          </Alert>
        </Snackbar>
      }
    </React.Fragment>
  )
}