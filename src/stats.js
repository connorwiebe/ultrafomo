import React from 'react'
import Position from './position'
import fn from './fn'

export default ({positions, setPositions}) => {
  return (
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
              <Position key={symbol} symbol={symbol} position={position} setPositions={setPositions}/>
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
  )
}
