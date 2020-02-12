import React from 'react'
import fn from './fn'
import store from './store'

export default React.memo(({symbol, position, setPositions, setNotification}) => {
  const [loading, setLoading] = React.useState(false)

  const deletePosition = e => {
    setLoading(true)
    const deleteSymbol = e.target.id || e.currentTarget.id
    setTimeout(() => {
      setPositions(positions => {
        const storePositions = JSON.parse(store.get('positions'))
        delete storePositions[deleteSymbol]
        store.set('positions', storePositions)
        delete positions[deleteSymbol]
        const newPositions = {}
        Object.keys(positions).forEach((symbol, index) => {
          newPositions[symbol] = fn.updatePosition({symbol, length: Object.keys(positions).length, index})
        })
        setNotification({msg:'Stock removed'})
        return newPositions
      })
    }, (600 + Math.round(Math.random() * 400)))
  }

  return (
    <div className="stat-item">
      <div className="symbol">
        <div className="stat-item-color" style={{background: position.stats.color}}></div>
        <span className="stat-item-symbol">{symbol}</span>
      </div>
      <span>{position.stats.formatted.profit}</span>
      <span>{position.stats.formatted.dividends}</span>
      <span>{position.stats.formatted.roi}</span>
      <span>{position.stats.formatted.percentage}</span>
      <span>{position.stats.formatted.annualized}</span>
      <button onClick={deletePosition} id={symbol} className={`delete ${loading ? 'loading-dark' : ''}`}>
        <svg style={{display: loading ? 'none' : 'inherit'}} height="8" width="8" viewBox="0 0 8 8"><path d="M8 .8L7.2 0 4 3.2.8 0 0 .8 3.2 4 0 7.2l.8.8L4 4.8 7.2 8l.8-.8L4.8 4 8 .8z"/></svg>
      </button>
    </div>
  )
})
