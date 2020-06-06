import React from 'react'
import { Redirect, Route, RouteProps } from 'react-router'
import { JWT } from '../apollo/config'

export const ProtectedRoute: React.SFC<RouteProps> = (props) => {
  if (
    localStorage.getItem(JWT.LOCAL_STORAGE.TOKEN.NAME) &&
    localStorage.getItem(JWT.LOCAL_STORAGE.REFRESH_TOKEN.NAME)
  ) {
    return <Route {...props} />
  } else {
    return <Redirect to={{ pathname: '/login' }} />
  }
}