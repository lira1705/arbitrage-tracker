const exchange = require("./exchange");
const exchangeData = require("./exchange")

module.exports = function calculateExpectedProfit(exchangeA, exchangeB, minProfit=0.10, investment=100) {
  const dataA = exchangeData[exchangeA.exchange];
  const dataB = exchangeData[exchangeB.exchange];
  if (!dataA || !dataB) {
    console.log("Missing data for " + exchangeA.exchange + " or " + exchangeB.exchange);
    return null;
  }

  exchangeA.data = dataA
  exchangeB.data = dataB
  const profitA = profitOnBuyFromX(exchangeA, exchangeB, investment);
  const profitB = profitOnBuyFromX(exchangeB, exchangeA, investment);

  return profitA > profitB 
  ? makeResultObject(profitA, exchangeA.exchange, minProfit, investment) 
  : makeResultObject(profitB, exchangeB.exchange, minProfit, investment)
}
  
function profitOnBuyFromX(exchangeX, exchangeY, investment) {
  const priceX = exchangeX.priceUsd * investment;
  const priceY = exchangeY.priceUsd * investment;
  const { buyTax, buyCost } = exchangeX.data;
  const { sellTax, sellCost } = exchangeY.dataY;

  const profit = ((priceX - buyCost) * (1 - buyTax)) - ((priceY - sellCost) * (1 - sellTax));
  return profit;
}

function makeResultObject(profit, exchange, minProfit, investment) {
  if (profit > (investment * minProfit)) {
    return {
      exchange,
      profit,
      profitability: (profit / investment) * 100,
      investment,
    };
  }
}