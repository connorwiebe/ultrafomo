import React from 'react'
import fn from './fn'
import store from './store'
import {NotificationContext} from './notification_provider'


export default ({symbol, position, setPositions}) => {
  const [loading, setLoading] = React.useState(false)
  const {setNotification} = React.useContext(NotificationContext)

  const deletePosition = e => {
    setLoading(true)
    const deleteSymbol = e.target.id || e.currentTarget.id
    setTimeout(() => {
      setPositions(positions => {
        delete positions[deleteSymbol]
        const newPositions = fn.getPositions(positions)
        store.updateStore(newPositions)
        setNotification({msg:'Stock removed'})
        return {...newPositions}
      })
    }, (600 + Math.round(Math.random() * 400)))
  }

  const changePercentage = e => {
    const changeSymbol = e.target.id
    const percentage = +e.target.value

    setPositions(positions => {
      Object.keys(positions).forEach(symbol => {
        if (symbol === changeSymbol) {
          positions[symbol].percentage = percentage
        }
      })

      const newPositions = fn.getPositions(positions)
      store.updateStore(newPositions)
      return {...newPositions}
    })
  }

  return (
    <div className="stat-item">
      <div data-name="Symbol" className="stat-data symbol">
        <div className="stat-data-color" style={{background: position.color}}></div>
        <span className="stat-data-symbol">{symbol}</span>
      </div>
      <span data-name="Profit" className="stat-data">{position.formatted.profit}</span>
      <span data-name="Dividends" className="stat-data">{position.formatted.dividends}</span>
      <span data-name="Return" className="stat-data">{position.formatted.roi}</span>
      <div data-name="Allocation" className="stat-data percentage">
        <select onChange={changePercentage} defaultValue={position.percentage} name="percentage" id={symbol}>
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
      <span data-name="Annualized Return" className="stat-data">{position.formatted.annualized}</span>
      <button onClick={deletePosition} id={symbol} className={`delete ${loading ? 'loading-dark' : ''}`}>
        <svg style={{display: loading ? 'none' : 'inherit'}} height="8" width="8" viewBox="0 0 8 8"><path d="M8 .8L7.2 0 4 3.2.8 0 0 .8 3.2 4 0 7.2l.8.8L4 4.8 7.2 8l.8-.8L4.8 4 8 .8z"/></svg>
      </button>
    </div>
  )
}
