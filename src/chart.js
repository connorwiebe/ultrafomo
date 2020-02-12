import React from 'react'
import {Chart, Line} from 'react-chartjs-2'
import fn from './fn'
import numeral from 'numeral'

export default React.memo(({positions}) => {

  // const { min, max } = fn.minmax(positions)
  Chart.Tooltip.positioners.custom = (els, pos) => {
    const y = els[0]._model.y
    if (y < 100) return {x: pos.x, y: els[0]._model.y + 80}
    return {x: pos.x, y: els[0]._model.y - 80}
  }
  const datasets = Object.keys(positions).map(item => positions[item].dataset)

  return (
    <div className="chart-container">
      <div className={`empty-container ${!Object.keys(positions).length ? 'display' : ''}`}>
        <h2 className="empty-title">Search</h2>
        <span className="empty-subtitle">Type a symbol in the search input to get started.</span>
      </div>
      <div className="chart">
        <Line
          datasetKeyProvider={() => Math.random()}
          options={{
            responsive: true,
            animation: {
              duration: 0
            },
            layout: {
              padding: -20,
              margin: 0
            },
            legend: {
              display: false
            },
            scales: {
              xAxes: [{
                gridLines: {
                  display: false
                },
                ticks: {
                  display: false,
                  fontColor: '#020202'
                },
                type: 'time',
                time: {
                  tooltipFormat: 'MMMM DD, YYYY',
                  unit: 'year'
                },
              }],
              yAxes: [{
                gridLines: {
                  display: false
                },
                ticks: {
                  display: false,
                  stepSize: 25,
                  fontColor: '#020202',
                  maxTicksLimit: 15,
                  // max: Math.round(max / 100) * 100 - 100,
                  // min: min === -1 ? 0 : Math.round(min / 50) * 50 - 50,
                  callback: (value, index, values) => `${value}%`
                },
              }]
            },
            tooltips: {
              mode: 'index',
              intersect: false,
              position: 'custom',
              caretSize: 0,
              cornerRadius: 0,
              borderColor: 'rgba(0,0,0,0)',
              backgroundColor: '#020202',
              bodyFontColor: '#fff',
              titleFontColor: '#fff',
              bodyFontStyle: 'normal',
              cornerRadius: 4,
              xPadding: 10,
              yPadding: 10,
              displayColors: false,
              titleFontFamily: "-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",
              bodyFontFamily: "-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",
              callbacks: {
                label: (item, data) => {
                  const symbol = data.datasets[item.datasetIndex].label
                  const price = positions[symbol].stats.range[item.index].price
                  const formattedPrice = numeral(price).format('$0,0.00')
                  const formattedRoi = numeral(item.yLabel / 100).format('0.00%')
                  return `${symbol}: ${formattedPrice} (${formattedRoi})`
                }
              }
            },
            hover: {
              mode: 'index',
              intersect: false,
              animationDuration: 0
            }
          }}
          data={{datasets: [{data: [0, 100]}, ...datasets]}}
        />
      </div>
    </div>
  )
})
