const defaults = {time: '', capital: '', positions: '{}'}

const getItem = ({key}) => {
  let value = localStorage.getItem(key)
  if (!value) {
    localStorage.setItem(key, defaults[key])
    value = defaults[key]
  }

  try {
    value = JSON.parse(value)
  } catch (err) {}

  return value
}

const setItem = ({key, item}) => {
  if (typeof item === 'object') {
    item = JSON.stringify(item)
  }
  localStorage.setItem(key, item)
}

export default {
  getItem,
  setItem,
  updateStore: newPositions => {
    const formattedPositions = Object.keys(newPositions).reduce((sum, symbol) => {
      sum[symbol] = {
        percentage: newPositions[symbol].percentage
      }
      return sum
    },{})
    setItem({key: 'positions', item: formattedPositions})
  }
}
