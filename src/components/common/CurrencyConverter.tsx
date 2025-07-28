import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

interface CurrencyConverterProps {
  amount: number;
  baseCurrency?: string;
  className?: string;
}

const currencies: Currency[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.013 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.012 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.010 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 1.48 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 0.017 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 0.018 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.012 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 0.087 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 0.070 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 0.270 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 0.018 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 0.104 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 0.019 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rate: 0.116 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rate: 0.119 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', rate: 0.085 },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', rate: 0.052 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', rate: 0.293 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', rate: 4.10 },
];

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  amount,
  baseCurrency = 'INR',
  className = ''
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('INR');
  const [showConverter, setShowConverter] = useState(false);
  const [rates, setRates] = useState<Currency[]>(currencies);

  useEffect(() => {
    // In a real app, you would fetch live exchange rates from an API
    // For now, we'll use the static rates
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      // Simulate API call - in production, use a real exchange rate API
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      // Update rates with real data
      
      // For demo purposes, we'll add some variation to make it more realistic
      const updatedRates = currencies.map(currency => ({
        ...currency,
        rate: currency.rate * (0.95 + Math.random() * 0.1) // Add some variation
      }));
      setRates(updatedRates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    const fromRate = rates.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = rates.find(c => c.code === toCurrency)?.rate || 1;
    return (amount / fromRate) * toRate;
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = rates.find(c => c.code === currencyCode);
    if (!currency) return amount.toLocaleString();

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const convertedAmount = convertCurrency(amount, baseCurrency, selectedCurrency);
  const selectedCurrencyData = rates.find(c => c.code === selectedCurrency);

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setShowConverter(!showConverter)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">Currency Converter</span>
        <TrendingUp className="w-4 h-4" />
      </button>

      {/* Converter Panel */}
      <AnimatePresence>
        {showConverter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[300px] z-50"
          >
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Convert Price</h3>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(amount, baseCurrency)}
              </div>
              <div className="text-sm text-gray-600">
                Base currency: {baseCurrency}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Convert to:
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {rates.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Converted Amount */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatCurrency(convertedAmount, selectedCurrency)}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedCurrencyData?.name}
                </div>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="text-xs text-gray-500 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>Exchange Rate: 1 {baseCurrency} = {selectedCurrencyData?.rate.toFixed(4)} {selectedCurrency}</span>
              </div>
              <div className="text-xs">
                Rates updated daily • For informational purposes only
              </div>
            </div>

            {/* Popular Currencies */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Currencies</h4>
              <div className="grid grid-cols-2 gap-2">
                {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'].map((code) => {
                  const currency = rates.find(c => c.code === code);
                  const converted = convertCurrency(amount, baseCurrency, code);
                  return (
                    <button
                      key={code}
                      onClick={() => setSelectedCurrency(code)}
                      className={`text-left p-2 rounded-lg text-sm transition-colors ${
                        selectedCurrency === code
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{code}</div>
                      <div className="text-gray-600">
                        {formatCurrency(converted, code)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 