import React, { useState, useEffect } from 'react'
import { Layout } from '../components'

interface Props { }

export const MainPageContainer: React.FC<Props> = () => {


  return <React.Fragment>
    <Layout content={
      <div>This is Main page</div>
    } />
  </React.Fragment>
}