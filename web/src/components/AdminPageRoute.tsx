import React from 'react'
import { Redirect, Route, RouteProps } from 'react-router'

export const AdminPageRoute: React.FC<RouteProps> = (props) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '')
  const { level } = currentUser
  if (level) {
    return <Route {...props} />
  } else {
    return <Redirect to={{ pathname: '/' }} />
  }
}