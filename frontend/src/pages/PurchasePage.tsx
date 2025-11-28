import React, {useEffect, useState, useMemo} from 'react';
import api from '../api/client';
import type {Purchase} from '../api/types';
import PurchaseHistoryTable from '../components/PurchaseHistoryTable';


export default function PurchasePage(){
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [searchProduct, setSearchProduct] = useState('');
      // BONUS TODO: Filter and sort states
  const [dateFilter, setDateFilter] = useState<'all' | '24h' | '7d'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'product'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Reload when any filter changes [BONUS TODO 5]
  useEffect(() => {
    loadPurchases();
  }, [searchProduct, dateFilter, sortField, sortOrder]);

  function loadPurchases(){
    setLoading(true);
    setError('');

    // Server Side Filtering Logic [BONUS TODO 5]
    const params = new URLSearchParams();

    // Map frontend 'dateFilter' to backend 'hours' param
    if (dateFilter === '24h') params.append('hours', '24');
    if (dateFilter === '7d') params.append('hours', '168');

    // Map sorting
    params.append('sortField', sortField);
    params.append('sortOrder', sortOrder);

    // Map search
    if (searchProduct) {
        params.append('searchTerm', searchProduct);
    }

    api.get(`/products/purchases?${params.toString()}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setPurchases(res.data);
        } else {
          setPurchases([]);
          setError('Backend not ready yet.');
        }
      })
      .catch(err => {
        console.error('Failed to load purchases:', err);
        setPurchases([]);
        setError('Could not connect to backend. Make sure it\'s running on http://localhost:5000');
      })
      .finally(() => setLoading(false));
  }

  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  }

  // Client-side filtering logic [TODO 4]
  // Note: While server-side filtering is implemented above via API params, 
  // this memo is kept to fulfill the [TODO 4] client-side requirement if backend filtering wasn't used.
  // Since backend does the heavy lifting now, this acts as a secondary filter or pass-through.
  const filteredAndSortedPurchases = useMemo(() => {
    let filtered = [...purchases];

    if (searchProduct) {
      // Client-side filter by search product (case-insensitive)
      filtered = filtered.filter(p => 
        p.productName.toLowerCase().includes(searchProduct.toLowerCase())
      );
    }

    return filtered;
  }, [purchases, searchProduct]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="space-y-2">
            <h2 className="text-5xl leading-[unset] font-black gradient-text mb-3 text-shadow">
              Purchase History
            </h2>
            <p className="text-gray-600 text-lg flex items-center gap-2">
              <span>📊</span> View and filter your purchase transactions
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert-error mb-6">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="spinner h-20 w-20 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">📋</span>
                </div>
              </div>
              <p className="text-gray-600 text-xl font-semibold">Loading purchase history...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && purchases.length === 0 && (
          <div className="glass-card rounded-3xl shadow-2xl p-16 text-center border-2 border-gray-200">
            <div className="text-8xl mb-6 animate-bounce">📋</div>
            <h3 className="text-3xl font-bold gradient-text mb-3">No Purchases Found</h3>
            <p className="text-gray-600 text-lg">Make a purchase on the Products page to see history here or adjust filters.</p>
          </div>
        )}

        {/* Removed check for purchases.length > 0 to allow showing filters even if empty results (e.g., search gave 0 results) */}
        {!loading && (
          <>
            <div className="glass-card rounded-3xl shadow-xl border-2 border-gray-200 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-2xl font-black gradient-text">Filters & Sorting</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search by product name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    🔎 Search Product
                  </label>
                  <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchProduct}
                    // debounce could be added here for optimization, but standard onChange is fine for this scale
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
               
                {/* Filter by date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    📅 Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as 'all' | '24h' | '7d')}
                    className="input-field w-full"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                  </select>
                </div>

                {/* Sort options */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    🔀 Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as 'date' | 'amount' | 'product')}
                      className="input-field flex-1"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="product">Product</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100 rounded-xl border-2 border-gray-300 font-black text-2xl transition-all shadow-md hover:shadow-lg active:scale-95"
                      title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-700">
                      Showing <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-black">{filteredAndSortedPurchases.length}</span> of{' '}
                      <span className="px-2 py-1 bg-gray-200 text-gray-900 rounded-lg font-black">{purchases.length}</span> purchases
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase table */}
            <PurchaseHistoryTable
              purchases={filteredAndSortedPurchases}
              formatDate={formatDate}
            />
          </>
        )}
      </div>
    </div>
  )
}
