from flask import Flask, jsonify, request
import yfinance as yf
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Enable logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/stock/<symbol>', methods=['GET'])
def get_stock(symbol):
    period = '1mo'  # Default to 1 month if no timeframe is specified

    stock = yf.Ticker(symbol)
    data = stock.history(period=period)
    if data.empty:
        return jsonify({'error': 'Invalid ticker symbol or no data available'}), 404

    stock_info = {
        'symbol': symbol,
        'history': data.to_dict(),
        'summary': stock.info.get('longBusinessSummary', 'No summary available'),
        'market_cap': stock.info.get('marketCap', 'N/A'),
        'pe_ratio': stock.info.get('trailingPE', 'N/A'),
        'dividend_yield': stock.info.get('dividendYield', 'N/A'),
        'beta': stock.info.get('beta', 'N/A')
    }

    data.index = data.index.strftime('%Y-%m-%d')
    json_data = {
        'history': data.to_dict(),
        'summary': stock_info['summary'],
        'market_cap': stock_info['market_cap'],
        'pe_ratio': stock_info['pe_ratio'],
        'dividend_yield': stock_info['dividend_yield'],
        'beta': stock_info['beta']
    }

    logging.debug(json_data)  # Log the returned data structure
    return jsonify(json_data)

if __name__ == '__main__':
    app.run(debug=True)
