import React from 'react'
import ReactDOM from 'react-dom'
import Main from './main'
import Navigation from './navigation'
import Notifications from './notifications'
import NotificationProvider from './notification_provider'
import './index.css'

const App = () => {

  return (
    <>
      <Navigation/>
      <Main/>
      <Notifications/>
    </>
  )
}

ReactDOM.render(
  <NotificationProvider>
    <App/>
  </NotificationProvider>,
  document.getElementById('root')
)
