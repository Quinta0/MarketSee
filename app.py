from flask import Flask, render_template, jsonify, request
import yfinance as yf

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_stock_data', methods=['GET'])
def get_stock_data():
    symbol = request.args.get('symbol', default='AAPL', type=str)
    data = yf.Ticker(symbol)
    hist = data.history(period="6mo")

    # Get additional stock details
    info = data.info
    current_price = info['currentPrice']
    previous_close = info['previousClose']
    daily_change = current_price - previous_close
    daily_change_percent = (daily_change / previous_close) * 100
    trading_volume = info['volume']
    week_52_high = info['fiftyTwoWeekHigh']
    week_52_low = info['fiftyTwoWeekLow']
    market_cap = info['marketCap']
    pe_ratio = info.get('trailingPE', 'N/A')
    dividend_yield = info.get('dividendYield', 'N/A')
    beta = info.get('beta', 'N/A')
    long_business_summary = info['longBusinessSummary']

    # Format the data for the frontend
    stock_data = {
        'dates': hist.index.strftime('%Y-%m-%d').tolist(),
        'close': hist['Close'].tolist(),
        'current_price': current_price,
        'daily_change': daily_change,
        'daily_change_percent': daily_change_percent,
        'trading_volume': trading_volume,
        'week_52_high': week_52_high,
        'week_52_low': week_52_low,
        'market_cap': market_cap,
        'pe_ratio': pe_ratio,
        'dividend_yield': dividend_yield,
        'beta': beta,
        'long_business_summary': long_business_summary
    }
    return jsonify(stock_data)

if __name__ == '__main__':
    app.run(debug=True)
