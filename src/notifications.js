import React from 'react'
import {CSSTransition} from 'react-transition-group'
import {NotificationContext} from './notification_provider'

const Notification = ({notification, setNotifications}) => {
  console.log('notification.js')
  const [active, setActive] = React.useState(false)

  React.useEffect(() => {
    setActive(prev => !prev)
  }, [notification])

  const color = notification.type === 'error' ? '#cd2137' : '#007eff'
  const typeStyle = {borderLeft: `1px solid ${color}`}

  return (
    <CSSTransition
      in={active}
      timeout={{
        enter: 3000,
        exit: 0
      }}
      classNames="notification"
      onEntered={() => {
        setActive(false)
      }}
      onExited={() => {
        setNotifications(notifications => {
          notifications.shift()
          return notifications
        })
      }}
      unmountOnExit>
      <div className="notification" style={typeStyle}>
        <span>{notification.msg}</span>
        <button onClick={() => setActive(false)}>
          <svg height="8" width="8" viewBox="0 0 8 8"><path d="M8 .8L7.2 0 4 3.2.8 0 0 .8 3.2 4 0 7.2l.8.8L4 4.8 7.2 8l.8-.8L4.8 4 8 .8z"/></svg>
        </button>
      </div>
    </CSSTransition>
  )
}

export default () => {
  console.log('notifications.js')
  const {notification} = React.useContext(NotificationContext)
  const [notifications, setNotifications] = React.useState([])

  React.useEffect(() => {
    if (!notification.msg) return
    setNotifications(notifications => {
      return [
        ...notifications,
        <Notification key={Math.random()} notification={notification} setNotifications={setNotifications}/>
      ]
    })
  }, [notification])

  return (
    <div className="notifications">
      {notifications}
    </div>
  )
}
