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
import Promise from 'bluebird'
import qs from 'query-string'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import './index.css'

const App = React.memo(() => {

  const [loading, setLoading] = React.useState({addStock: false, chart: null})
  const [notification, setNotification] = React.useState({msg: ''})
  const [positions, setPositions] = React.useState({})

  React.useEffect(() => {
    const storePositions = store.getItem({key: 'positions'})
    const qsParsed = qs.parse(window.location.search).s || ''
    const qsArray = qsParsed ? qsParsed.split(',') : []

    const qsSymbols = qsArray.filter(item => isNaN(item))
    const qsPercentages = qsArray.filter(item => !isNaN(item))

    const qsPositions = qsSymbols.reduce((sum, cur, i) => {
      sum[cur] = {percentage: +qsPercentages[i] / 100 || 0}
      return sum
    },{})

    const pendingPositions = {...storePositions, ...qsPositions}
    if (Object.keys(pendingPositions).length) {
      setLoading(loading => ({...loading, chart: true}))
    }

    const requests = Object.keys(pendingPositions).reduce((sum, symbol) => {
      sum.push(Promise.resolve(fn.getStock({symbol, positions: pendingPositions})))
      return sum
    },[])

    ;(async () => {

      const fulfilledPositions = {}
      await Promise.all(requests.map(request => request.reflect())).each(inspector => {
        if (inspector.isFulfilled()) {
          const stock = inspector.value()
          fulfilledPositions[stock.symbol] = {
            stock,
            percentage: pendingPositions[stock.symbol].percentage
          }
        } else {
          setNotification({msg: inspector.error().message, type: 'error'})
        }
      })

      const newPositions = fn.getPositions(fulfilledPositions)
      store.updateStore(newPositions)
      setLoading(loading => ({...loading, chart: false}))
      setPositions(newPositions)
    })()
  },[])

  const addStock = async e => {
    e.preventDefault()
    e.persist()
    const symbol = e.target.stock.value.toUpperCase()
    if (symbol === '' || positions[symbol]) return

    try {
      setLoading({...loading, addStock: true})
      const stock = await fn.getStock({symbol, positions})
      const newPositions = fn.getPositions({...positions, [symbol]: {stock}})
      store.updateStore(newPositions)
      setPositions({...newPositions})

    } catch (err) {
      console.log(err)
      setNotification({msg: err.message, type: 'error'})

    } finally {
      e.target.stock.value = ''
      setLoading({...loading, addStock: false})

    }
  }

  const changeOption = e => {
    e.persist()
    if (e.target.name === 'capital') {
      e.target.value = numeral(e.target.value).format('$0,0')
    }

    fn.defer(() => {
      const key = e.target.name
      const item = +(e.target.value.replace( /\D+/g,''))
      store.setItem({key, item})
      const newPositions = fn.getPositions(positions)
      setPositions({...newPositions})
    }, 1000)
  }


  const generateLink = () => {
    return Object.keys(positions).reduce((sum, symbol, i) => {
      sum += `${i ? ',' : ''}${symbol},${positions[symbol].percentage * 100}`
      return sum
    },'')
  }
  const shareStocks = () => {
    setNotification({msg: 'Link copied to clipboard'})
  }

  return (
    <React.Fragment>

      <header>
        <Logo/>
        <Menu/>
      </header>

      <main>
        <div className="info-panel">
          <Chart loading={loading} positions={positions}/>
          <div className="stats-container">
            <div className="stats">
                <div className="stat-item stats-titles">
                  <span>Symbol</span>
                  <span>Profit</span>
                  <span>Dividends</span>
                  <span>Return</span>
                  <span>Allocation</span>
                  <span>Annualized Return</span>
                </div>
                {Object.keys(positions).map(symbol => {
                  const position = positions[symbol]
                  return (
                    <Position key={symbol} symbol={symbol} position={position} setPositions={setPositions} setNotification={setNotification}/>
                  )
                })}
                <div className="stat-item stats-totals">
                  <span></span>
                  <span data-name="Total Profit" className="stat-data">{fn.getTotals(positions).totalProfit}</span>
                  <span data-name="Total Dividends" className="stat-data">{fn.getTotals(positions).totalDividends}</span>
                  <span data-name="Total Return" className="stat-data">{fn.getTotals(positions).totalRoi}</span>
                  <span data-name="Total Allocation" className="stat-data">{fn.getTotals(positions).totalPercentage}</span>
                  <span data-name="Total Annualized Return" className="stat-data">{fn.getTotals(positions).totalAnnualizedRoi}</span>
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
              <input onChange={changeOption} name="time" id="time" defaultValue={store.getItem({key: 'time'})} type="number" placeholder="15" title="The number of years of data."/>
              <span className="input-tip">The number of years of data.</span>
            </div>

            <div className="input-group">
              <label htmlFor="capital" className="input-title">Capital</label>
              <input onChange={changeOption} name="capital" id="capital" defaultValue={numeral(store.getItem({key: 'capital'})).format('$0,0')} type="text" placeholder="$10,000" title="The amount of starting capital to be invested."/>
              <span className="input-tip">The amount of starting capital to be invested.</span>
            </div>

            <button className={`btn add-stock-btn ${loading.addStock ? 'loading-light' : ''}`} type="submit">Add Stock</button>
          </form>
          <CopyToClipboard text={`https://ultrafomo.com/?s=${generateLink()}`}>
            <button onClick={shareStocks} className="share">Share</button>
          </CopyToClipboard>
        </div>
      </main>

      <Notifications notification={notification}/>
    </React.Fragment>
  )
})

ReactDOM.render(<App/>,document.getElementById('root'))
