import React from 'react'
import ReactDOM from 'react-dom'
import fn from './fn'
import store from './store'
import Chart from './chart'
import Logo from './logo'
import Notifications from './notifications'
import Position from './position'
import Menu from './menu'
import numeral from 'numeral'
import './index.css'

const App = React.memo(() => {

  const [loading, setLoading] = React.useState(false)
  const [notification, setNotification] = React.useState({msg:''})
  const [positions, setPositions] = React.useState(JSON.parse(store.get('positions')))

  const addStock = async e => {
    e.preventDefault()
    e.persist()
    const symbol = e.target.stock.value.toUpperCase()
    if (symbol === '' || positions[symbol]) return
    // if (Object.keys(positions).length >= 5) {
    //   return setNotification({msg: 'Maximum 5 stocks', type: 'error'})
    // }
    try {
      setLoading(true)
      await fn.getStock(symbol)
      const position = fn.updatePosition({symbol})
      setPositions(positions => ({...positions, [symbol]: position}))
    } catch (err) {
      setNotification({msg: 'Stock not found', type: 'error'})
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
      const value = +(e.target.value.replace( /\D+/g,''))
      store.set(key, value)
      const newPositions = {}
      Object.keys(positions).forEach((symbol, index) => {
        newPositions[symbol] = fn.updatePosition({symbol})
      })
      setPositions(newPositions)
    }, 1000)
  }

  return (
    <React.Fragment>

      <header>
        <Logo/>
        <Menu/>
      </header>

      <main>
        <div className="info-panel">
          <Chart positions={positions}/>
          <div className="stats-container">
            <div className="stats">
                <div className="stat-item stat-titles">
                  <span>Symbol</span>
                  <span>Profit</span>
                  <span>Dividends</span>
                  <span>Total Return</span>
                  <span>Portfolio %</span>
                  <span>Annualized Return</span>
                </div>
                {Object.keys(positions).map(symbol => {
                  const position = positions[symbol]
                  return (
                    <Position key={symbol} symbol={symbol} position={position} setPositions={setPositions} setNotification={setNotification}/>
                  )
                })}
                <div className="stat-item stat-totals">
                  <span></span>
                  <span>{fn.getTotals(positions).totalProfit}</span>
                  <span>{fn.getTotals(positions).totalDividends}</span>
                  <span>{fn.getTotals(positions).totalRoi}</span>
                  <span>{fn.getTotals(positions).totalPercentage}</span>
                  <span>{fn.getTotals(positions).totalAnnualizedRoi}</span>
                </div>
            </div>
          </div>
        </div>
        <div className="search-panel">

          <h2>Add Stock</h2>

          <form onSubmit={addStock}>

            <div className="input-group">
              <label htmlFor="stock" className="input-title">Symbol</label>
              <input type="text" name="stock" id="stock" placeholder="AAPL" title="The stock symbol name."/>
              <span className="input-tip">The stock symbol name.</span>
            </div>

            <div className="input-group">
              <label htmlFor="time" className="input-title">Years</label>
              <input onChange={changeOption} name="time" id="time" defaultValue={store.get('time')} type="number" placeholder="15" title="The number of years of data."/>
              <span className="input-tip">The number of years of data.</span>
            </div>

            <div className="input-group">
              <label htmlFor="capital" className="input-title">Capital</label>
              <input onChange={changeOption} name="capital" id="capital" defaultValue={numeral(store.get('capital')).format('$0,0')} type="text" placeholder="$10,000" title="The amount of starting capital to be invested."/>
              <span className="input-tip">The amount of starting capital to be invested.</span>
            </div>

            <button className={`btn add-stock-btn ${loading ? 'loading-light' : ''}`} type="submit">Add Stock</button>
          </form>
        </div>
      </main>

      <Notifications notification={notification}/>
    </React.Fragment>
  )
})

ReactDOM.render(<App/>,document.getElementById('root'))
