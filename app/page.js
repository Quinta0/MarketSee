"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveLine } from "@nivo/line";

// Function to fetch stock data from the backend
async function fetchStockData(symbol) {
  const response = await fetch(`http://127.0.0.1:5000/stock/${symbol}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
}

export default function Component() {
  const [symbol, setSymbol] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("1M");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);
  const [dailyChangePercent, setDailyChangePercent] = useState(0);
  const [highestPrice, setHighestPrice] = useState(0);
  const [lowestPrice, setLowestPrice] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStockData(symbol).then(data => {
      // Log the received data structure
      console.log('Received data:', data);

      // Ensure the data structure is correctly parsed
      const history = Object.keys(data['Close']).map(date => ({
        date: date,
        price: data['Close'][date]
      }));

      setStockData(history);
      const latestPrice = history[history.length - 1].price;
      const firstPrice = history[0].price;
      const change = latestPrice - firstPrice;
      setCurrentPrice(latestPrice);
      setDailyChange(change);
      setDailyChangePercent((change / firstPrice) * 100);
      setHighestPrice(Math.max(...history.map(item => item.price)));
      setLowestPrice(Math.min(...history.map(item => item.price)));
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching stock data:', error);
      setError('Failed to fetch stock data. Please check the ticker symbol.');
      setLoading(false);
    });
  }, [symbol]);

  const filteredData = useMemo(() => {
    switch (timeframe) {
      case "1D":
        return stockData.slice(-1);
      case "1W":
        return stockData.slice(-7);
      case "1M":
        return stockData;
      case "3M":
        return stockData.slice(-90);
      case "1Y":
        return stockData.slice(-365);
      default:
        return stockData;
    }
  }, [timeframe, stockData]);

  const handleSearch = (e) => {
    e.preventDefault();
    const ticker = e.target.elements.ticker.value.trim().toUpperCase();
    if (ticker) {
      setSymbol(ticker);
    }
  };

  return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 bg-gradient-to-br from-[#f0f0f0] to-[#d0d0d0] text-gray-800 shadow-lg shadow-[#d0d0d0]/50 rounded-2xl">
        <form onSubmit={handleSearch} className="mb-4">
          <input type="text" name="ticker" placeholder="Enter stock ticker" className="p-2 border border-gray-300 rounded" />
          <Button type="submit" className="ml-2 bg-[#8e44ad] hover:bg-[#9b59b6] text-white">Search</Button>
        </form>
        <div className="grid gap-8 md:gap-12">
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">{symbol}</h1>
            <div className="flex items-center gap-2">
              <Button variant={timeframe === "1D" ? "solid" : "outline"} onClick={() => setTimeframe("1D")} className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white">1D</Button>
              <Button variant={timeframe === "1W" ? "solid" : "outline"} onClick={() => setTimeframe("1W")} className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white">1W</Button>
              <Button variant={timeframe === "1M" ? "solid" : "outline"} onClick={() => setTimeframe("1M")} className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white">1M</Button>
              <Button variant={timeframe === "3M" ? "solid" : "outline"} onClick={() => setTimeframe("3M")} className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white">3M</Button>
              <Button variant={timeframe === "1Y" ? "solid" : "outline"} onClick={() => setTimeframe("1Y")} className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white">1Y</Button>
            </div>
          </div>
          <div className="bg-[#f0f0f0] rounded-lg shadow-lg shadow-[#d0d0d0]/50 overflow-hidden">
            <div className="p-6 md:p-8">
              {loading ? <p>Loading...</p> : <TimeseriesChart data={filteredData} className="aspect-[16/9]" />}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-[#f0f0f0] rounded-lg shadow-lg shadow-[#d0d0d0]/50 p-6 md:p-8">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="text-gray-500">Current Price</div>
                  <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500">Daily Change</div>
                  <div className={`text-2xl font-bold ${dailyChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%)
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500">Trading Volume</div>
                  <div className="text-2xl font-bold">{(Math.random() * 1000000).toFixed(0)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500">52-Week High</div>
                  <div className="text-2xl font-bold">${highestPrice.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500">52-Week Low</div>
                  <div className="text-2xl font-bold">${lowestPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="bg-[#f0f0f0] rounded-lg shadow-lg shadow-[#d0d0d0]/50 p-6 md:p-8">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-bold">About {symbol}</h3>
                  <p className="text-gray-500">
                    Apple Inc. is an American multinational technology company that designs, develops, and sells consumer electronics, computer software, and online services.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Key Information</h3>
                  <div className="grid gap-2 text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Market Cap:</span>
                      <span>$2.5 Trillion</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>P/E Ratio:</span>
                      <span>27.5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dividend Yield:</span>
                      <span>0.6%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Beta:</span>
                      <span>1.3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

function TimeseriesChart({ data, ...props }) {
  if (!data || data.length === 0) {
    return <p>No data available</p>;
  }

  return (
      <div {...props}>
        <ResponsiveLine
            data={[
              {
                id: "Price",
                data: data.map(d => ({ x: d.date, y: d.price })),
              },
            ]}
            margin={{ top: 10, right: 20, bottom: 40, left: 40 }}
            xScale={{
              type: "time",
              format: "%Y-%m-%d",
              useUTC: false,
              precision: "day",
            }}
            xFormat="time:%Y-%m-%d"
            yScale={{
              type: "linear",
              min: 0,
              max: "auto",
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 16,
              format: "%d",
              tickValues: "every 1 day",
            }}
            axisLeft={{
              tickSize: 0,
              tickValues: 5,
              tickPadding: 16,
            }}
            colors={["#2563eb"]}
            pointSize={6}
            useMesh={true}
            gridYValues={6}
            theme={{
              tooltip: {
                chip: {
                  borderRadius: "9999px",
                },
                container: {
                  fontSize: "12px",
                  textTransform: "capitalize",
                  borderRadius: "6px",
                },
              },
              grid: {
                line: {
                  stroke: "#f3f4f6",
                },
              },
            }}
            role="application"
        />
      </div>
  );
}
