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
          newPositions[symbol] = fn.updatePosition({symbol})
        })
        setNotification({msg:'Stock removed'})
        return newPositions
      })
    }, (600 + Math.round(Math.random() * 400)))
  }

  const changePercentage = e => {
    const symbol = e.target.id
    const percentage = +e.target.value
    setPositions(positions => {
      const position = fn.updatePosition({symbol, percentage})
      return {...positions, [symbol]: position}
    })
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
      <div className="percentage">
        <select onChange={changePercentage} defaultValue={position.stats.percentage} name="percentage" id={symbol}>
          <option value="0">0%</option>
          <option value="0.1">10%</option>
          <option value="0.2">20%</option>
          <option value="0.3">30%</option>
          <option value="0.4">40%</option>
          <option value="0.5">50%</option>
          <option value="0.6">60%</option>
          <option value="0.7">70%</option>
          <option value="0.8">80%</option>
          <option value="0.9">90%</option>
          <option value="1">100%</option>
        </select>
      </div>
      <span>{position.stats.formatted.annualized}</span>
      <button onClick={deletePosition} id={symbol} className={`delete ${loading ? 'loading-dark' : ''}`}>
        <svg style={{display: loading ? 'none' : 'inherit'}} height="8" width="8" viewBox="0 0 8 8"><path d="M8 .8L7.2 0 4 3.2.8 0 0 .8 3.2 4 0 7.2l.8.8L4 4.8 7.2 8l.8-.8L4.8 4 8 .8z"/></svg>
      </button>
    </div>
  )
})
