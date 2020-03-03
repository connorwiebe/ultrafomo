import React from 'react'
import Logo from './logo'
import Menu from './menu'

export default () => {
  console.log('navigation.js')
  return (
    <header>
      <Logo/>
      <Menu/>
    </header>
  )
}
