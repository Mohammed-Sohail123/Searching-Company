


import { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = "YOUR_TWELVE_DATA_API_KEY"; // Replace with actual API key
const SEARCH_URL = "https://api.twelvedata.com/symbol_search";
const QUOTE_URL = "https://api.twelvedata.com/quote";

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    // Debounce API calls to reduce excessive requests
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        fetchStockSearch();
      } else {
        setResults([]);
      }
    }, 400); // Adjust debounce timing

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchStockSearch = async () => {
    try {
      const response = await axios.get(SEARCH_URL, {
        params: { symbol: query, apikey: API_KEY },
      });
      setResults(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching stock search:", error);
      setResults([]);
    }
  };

  const fetchStockDetails = async (symbol) => {
    try {
      const response = await axios.get(QUOTE_URL, {
        params: { symbol, apikey: API_KEY },
      });
      setSelectedStock(response.data || null);
    } catch (error) {
      console.error("Error fetching stock details:", error);
      setSelectedStock(null);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <SearchBar query={query} setQuery={setQuery} />

      <div className="w-full max-w-md">
        {!selectedStock && results.length > 0 && (
          <div className="space-y-3">
            {results.map((stock, index) => (
              <StockItem key={index} stock={stock} fetchStockDetails={fetchStockDetails} />
            ))}
          </div>
        )}

        {selectedStock && <StockDetails stock={selectedStock} setSelectedStock={setSelectedStock} />}
      </div>
    </div>
  );
}

const SearchBar = ({ query, setQuery }) => (
  <div className="relative w-full max-w-md">
    <input
      type="text"
      placeholder="Company or stock symbol..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full border rounded-md pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const StockItem = ({ stock, fetchStockDetails }) => (
  <div
    className="p-3 border rounded-md hover:bg-gray-100 cursor-pointer"
    onClick={() => fetchStockDetails(stock.symbol)}
  >
    <p className="font-semibold">{stock.name}</p>
    <p className="text-sm text-gray-500">{stock.symbol}</p>
  </div>
);

const StockDetails = ({ stock, setSelectedStock }) => (
  <div className="p-4 border rounded-md shadow mt-4">
    <h2 className="text-xl font-bold mb-2">
      {stock.name} ({stock.symbol})
    </h2>
    <div className="space-y-1 text-sm text-gray-700">
      <p>Price: ${stock.price}</p>
      <p>Open: ${stock.open}</p>
      <p>High: ${stock.high}</p>
      <p>Low: ${stock.low}</p>
      <p>Volume: {stock.volume}</p>
      <p>Exchange: {stock.exchange}</p>
    </div>
    <button
      className="mt-4 text-blue-500 underline text-sm"
      onClick={() => setSelectedStock(null)}
    >
      ← Back to results
    </button>
  </div>
);
