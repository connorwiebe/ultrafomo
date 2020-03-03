import React from 'react'
import numeral from 'numeral'
import fn from './fn'
import store from './store'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {NotificationContext} from './notification_provider'
// import api from './api'

export default ({positions, setPositions}) => {
  console.log('search.js')
  const {setNotification} = React.useContext(NotificationContext)
  const [loading, setLoading] = React.useState(false)

  const addStock = async e => {
    e.preventDefault()
    e.persist()
    const symbol = e.target.stock.value.toUpperCase()
    if (symbol === '' || positions[symbol]) return

    try {
      setLoading(true)
      const stock = await fn.getStock({ symbol, positions })
      const newPositions = fn.getPositions({ ...positions, [symbol]: { stock } })
      store.updateStore(newPositions)
      setPositions({ ...newPositions })

    } catch (err) {
      console.log(err)
      setNotification({ msg: err.message, type: 'error' })

    } finally {
      e.target.stock.value = ''
      setLoading(false)

    }
  }
  const changeOption = e => {
    e.persist()
    if (e.target.name === 'capital') {
      e.target.value = numeral(e.target.value).format('$0,0')
    }

    fn.defer(() => {
      const key = e.target.name
      const item = +(e.target.value.replace(/\D+/g, ''))
      store.setItem({ key, item })
      const newPositions = fn.getPositions(positions)
      setPositions({ ...newPositions })
    }, 1000)
  }
  const generateLink = () => {
    return Object.keys(positions).reduce((sum, symbol, i) => {
      sum += `${i ? ',' : ''}${symbol},${positions[symbol].percentage * 100}`
      return sum
    }, '')
  }
  const shareStocks = () => {
    setNotification({ msg: 'Link copied to clipboard' })
  }

  return (
    <div className="search-panel">
      <h2>Add Stock</h2>

      <form onSubmit={addStock}>

        <div className="input-group">
          <label htmlFor="stock" className="input-title">Symbol</label>
          <input type="text" name="stock" id="stock" placeholder="AAPL" title="The stock symbol name." />
          <span className="input-tip">The stock symbol name.</span>
        </div>

        <div className="input-group">
          <label htmlFor="time" className="input-title">Years</label>
          <input onChange={changeOption} name="time" id="time" defaultValue={store.getItem({ key: 'time' })} type="number" placeholder="15" title="The number of years of data." />
          <span className="input-tip">The number of years of data.</span>
        </div>

        <div className="input-group">
          <label htmlFor="capital" className="input-title">Capital</label>
          <input onChange={changeOption} name="capital" id="capital" defaultValue={numeral(store.getItem({ key: 'capital' })).format('$0,0')} type="text" placeholder="$10,000" title="The amount of starting capital to be invested." />
          <span className="input-tip">The amount of starting capital to be invested.</span>
        </div>

        <button className={`btn add-stock-btn ${loading ? 'loading-light' : ''}`} type="submit">Add Stock</button>
      </form>
      <CopyToClipboard text={`https://ultrafomo.com/?s=${generateLink()}`}>
        <button onClick={shareStocks} className="share">Share</button>
      </CopyToClipboard>
    </div>
  )
}