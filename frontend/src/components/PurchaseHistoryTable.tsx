import React from 'react';
import type { Purchase } from '../api/types';

interface PurchaseHistoryTableProps {
  purchases: Purchase[];
  formatDate: (dateString: string) => string;
}

export default function PurchaseHistoryTable({ purchases, formatDate }: PurchaseHistoryTableProps) {
  if (purchases.length === 0) {
    return (
      <div className="glass-card rounded-3xl shadow-2xl p-16 text-center border-2 border-dashed border-gray-300">
        <div className="text-8xl mb-6">🔎</div>
        <h3 className="text-2xl font-black gradient-text mb-3">No Matching Purchases</h3>
        <p className="text-gray-600 text-lg">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

return (
    <div className="glass-card rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
            {/* Table Headers [TODO 4] */}
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100">
            {/* Table Rows [TODO 4] */}
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-xl mr-3">
                        {/* Fallback emoji logic */}
                        {purchase.productName.includes('Coke') || purchase.productName.includes('Pepsi') ? '🥤' : '📦'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{purchase.productName}</div>
                      <div className="text-xs text-gray-500">Qty: {purchase.quantity}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full bg-green-100 text-green-800">
                    ${purchase.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                  {formatDate(purchase.purchaseTime)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}