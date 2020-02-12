import { Buffer } from 'buffer'

export default {
  set: (key, value) => {
    let store = JSON.parse(localStorage.getItem('ultrafomo'))
    store[key] = typeof value === 'object' ? JSON.stringify(value) : value





    localStorage.setItem('ultrafomo', JSON.stringify(store))
  },
  get: key => {
    let store = localStorage.getItem('ultrafomo') || JSON.stringify({time: '', capital: '', positions: '{}'})
    localStorage.setItem('ultrafomo', store)
    store = JSON.parse(store)
    return store[key]
  }
}
