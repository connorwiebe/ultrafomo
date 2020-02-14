import moment from 'moment'
import store from './store'
import wA from 'weighted-average'
import numeral from 'numeral'
import palettes from 'nice-color-palettes'
import interpolate from 'color-interpolate'

const getStock = async symbol => {

  // check if store has stock first
  const positions = JSON.parse(store.get('positions'))
  let stock = positions[symbol] && positions[symbol].stock
  if (stock && !moment(stock.lastUpdated).diff(Date.now(), 'days')) return stock

  // otherwise make network request for stock
  let response = await fetch(`https://0zqs2xabdg.execute-api.ca-central-1.amazonaws.com/fuck?symbol=${symbol}`)
  if (!response.ok) throw Error(`Couldn't find stock ${symbol}.`)
  response = await response.json()
  stock = {
    data: response.data,
    lastUpdated: response.lastUpdated
  }
  store.set('positions', {...positions, [symbol]: {stock, stats:{}}})
  return stock
}
const getStats = ({symbol, percentage}) => {
  const timeOption = store.get('time')
  const capitalOption = store.get('capital')
  const storePositions = JSON.parse(store.get('positions'))
  const stock = storePositions[symbol].stock

  // find closest start day
  let time = moment().subtract(timeOption, 'years').format('YYYY-MM-DD')
  let startIndex = 0
  loop1: for (let j=0;j<10;j++) {
    for (let i=0;i<stock.data.length;i++) {
      const item = stock.data[i]
      if (item.date === time) {
        startIndex = i
        break loop1
      }
    }
    if (startIndex !== 0) break
    time = moment(time).add(1, 'days').format('YYYY-MM-DD')
  }

  // get range
  if (timeOption > 20 || startIndex === 0) startIndex = stock.data.length

  let range = stock.data.slice(0, startIndex + 1).reverse()
  const startPrice = range[0].price
  const endPrice = range[range.length - 1].price

  range = range.map(item => {
    const profit = item.price - startPrice
    const roi = profit / startPrice
    item.roi = roi
    item.profit = profit
    return item
  })

  const days = moment(range[range.length - 1].date).diff(range[0].date, 'days')
  const years = days / 365
  const remainingDays = days % 365
  let timespan = `${Math.floor(years)} Year${Math.floor(years) === 1 ? '' : 's'}`
  if (remainingDays) timespan += `, ${remainingDays} Day${remainingDays === 1 ? '' : 's'}`

  // get profit & roi
  const sum = Object.keys(storePositions).reduce((sum, key) => sum += storePositions[key].stats.percentage || 0, 0)
  const remainder = Math.round(((1-sum) < 0 ? 0 : (1-sum)) * 100) / 100
  percentage = percentage !== undefined ? percentage : storePositions[symbol].stats.percentage || remainder

  const alloc = capitalOption * percentage
  const shares = Math.floor(alloc / startPrice)
  const startMktValue = shares * startPrice
  const endMktValue = shares * endPrice
  const dividends = range.reduce((sum,cur) => sum + cur.dividend, 0) * shares
  const profit = (endPrice - startPrice) * shares
  const roi = (profit / alloc) || 0
  const annualized = (((1 + (roi / 100)) ** (365 / days)) - 1) * 100

  const getGradient = interpolate(palettes[32])
  const length = Object.keys(storePositions).length + 1
  const gradient = Array.from({ length }, (v, i) => getGradient(i / length))
  const usedColors = Object.keys(storePositions).map(symbol => storePositions[symbol].stats.color)
  const availableColors = gradient.filter(color => !usedColors.includes(color))
  const color = storePositions[symbol].stats.color || availableColors.shift()

  return {
    symbol,
    shares,
    dividends,
    profit,
    roi,
    percentage,
    timespan,
    startMktValue,
    endMktValue,
    annualized,
    range,
    color,
    formatted: {
      profit: numeral(profit).format('$0,0.00'),
      roi: numeral(roi).format('0,.00%'),
      percentage: numeral(percentage).format('0,.00%'),
      annualized: numeral(annualized).format('0,.00%'),
      dividends: numeral(dividends).format('$0,0.00')
    }
  }
}
const getCoords = data => {
  const coords = data.map(item => {
    return {
      y: item.roi * 100,
      x: moment(item.date).valueOf()
    }
  })
  return coords
}
const getDataset = ({symbol, coords, stats}) => {
  return {
    borderColor: stats.color,
    pointBackgroundColor: stats.color,
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 2,
    lineTension: 0.1,
    fill: false,
    borderWidth: 2,
    pointHitRadius: 20,
    pointHoverRadius: 3,
    pointRadius: 0,
    label: symbol,
    data: coords
  }
}
const updatePosition = ({symbol, percentage}) => {
  const stats = getStats({symbol, percentage})
  const coords = getCoords(stats.range)
  const dataset = getDataset({symbol, coords, stats})
  const storePositions = JSON.parse(store.get('positions'))
  const {stock} = storePositions[symbol]
  const position = {stock, stats, coords, dataset}
  store.set('positions', {...storePositions, [symbol]: position})
  return position
}
const defer = (timer => {
  return (callback, ms) => {
    clearTimeout(timer)
    timer = setTimeout(callback, ms)
  }
})()
const minmax = positions => {
  const sorted = Object.keys(positions).reduce((sum, cur) => {
    const position = positions[cur]
    const range = position.coords.map(item => item.y)
    sum = [...sum, ...range]
    return sum
  },[]).sort((a,b) => a-b)
  return {
    min: Math.floor(sorted.shift()),
  	max: Math.floor(sorted.pop())
  }

  // ticks: {
  //   min: min - 10,
  //   max: max + 10,
  //   callback: (value, index, values) => `${value}%`
  // },

}
const getTotals = positions => {
  const totalProfit = () => {
    const totalProfit = Object.keys(positions).reduce((sum,cur) => sum += positions[cur].stats.profit,0)
    return numeral(totalProfit).format('$0,0.00')
  }
  const totalRoi = () => {
    const formattedPositions = Object.keys(positions).map(key => ({val: positions[key].stats.roi, weight: positions[key].stats.percentage}))
    const weightedAverage = wA(formattedPositions)
    return numeral(weightedAverage).format('0,.00%')
  }
  const totalAnnualizedRoi = () => {
    const formattedPositions = Object.keys(positions).map(key => ({val: positions[key].stats.annualized, weight: positions[key].stats.percentage}))
    const weightedAverage = wA(formattedPositions)
    return numeral(weightedAverage).format('0,.00%')
  }
  const totalPercentage = () => {
    const totalPercentage = Object.keys(positions).reduce((sum,cur) => sum += positions[cur].stats.percentage,0)
    return numeral(totalPercentage).format('0.00%')
  }
  const totalDividends = () => {
    const totalDividends = Object.keys(positions).reduce((sum,cur) => sum += positions[cur].stats.dividends, 0)
    return numeral(totalDividends).format('$0,0.00')
  }
  return {
    totalProfit: totalProfit(),
    totalRoi: totalRoi(),
    totalAnnualizedRoi: totalAnnualizedRoi(),
    totalPercentage: totalPercentage(),
    totalDividends: totalDividends()
  }
}

export default {
  updatePosition,
  getStock,
  defer,
  minmax,
  getTotals
}
