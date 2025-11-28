import React from 'react';
import type { Product } from '../api/types';

interface ProductCardProps {
  product: Product;
  quantity: number;
  isPurchasing: boolean;
  balance: number | null;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onBuyProduct: (productId: string) => void;
}

export default function ProductCard({
  product,
  quantity,
  isPurchasing,
  balance,
  onUpdateQuantity,
  onBuyProduct
}: ProductCardProps) {
  const totalCost = product.price * quantity;
  // [BONUS TODO 3]: Check if product is low stock and apply appropriate UI styles
  const isLowStock = product.stock <= 2;
  const isOutOfStock = product.stock === 0;

  return (
    <div
      key={product.id}
      className={`product-card border-gray-300 ${isOutOfStock ? 'opacity-75' : ''}`}
    >
      {/* Product Header with Icon */}
      <div className={`relative p-7 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600`}>
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
          <span className="text-2xl">
            
          </span>
        </div>
        <h3 className="text-2xl font-black text-white text-shadow-lg pr-12">{product.name}</h3>
        {/* NOTES: This is just an example for you to comment out to test, you need to add your own UI styles! */}
        {/* Latest Add: Low Stock Badge [BONUS TODO 3] */}
        {isLowStock && !isOutOfStock && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
              ⚡ Low Stock
            </span>
          </div>
        )} 
      </div>

      <div className="p-6 space-y-4">
        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Price</div>
            <div className="text-2xl font-black text-gray-900">${product.price.toFixed(2)}</div>
          </div>
          <div className={`p-4 rounded-xl border-2 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200`}>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Stock</div>
            <div className={`text-2xl font-black`}>
              {product.stock}
            </div>
          </div>
        </div>

        {/* Quantity Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Quantity</label>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100 disabled:from-gray-50 disabled:to-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-all font-black text-2xl shadow-md hover:shadow-lg active:scale-95 border-2 border-gray-300"
            >
              −
            </button>
            <div className="flex-1 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl">
              <span className="text-2xl font-black text-gray-900">{quantity}</span>
            </div>
            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100 disabled:from-gray-50 disabled:to-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-all font-black text-2xl shadow-md hover:shadow-lg active:scale-95 border-2 border-gray-300"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Cost */}
        <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-white/90 font-bold uppercase tracking-wide text-sm">Total</span>
            <span className="text-3xl font-black text-white text-shadow-lg">${totalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Button Logic [TODO 2] */}
        <button
          onClick={() => onBuyProduct(product.id)}
          disabled={balance === null || isOutOfStock || isPurchasing}
          className={`w-full py-4 px-6 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl 
            ${balance === null || isOutOfStock || isPurchasing 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white hover:shadow-2xl hover:scale-105 active:scale-95'}`}
        >
          {balance === null 
            ? '🔒 Start Machine First' 
            : isPurchasing 
                ? '⏳ Processing...' 
                : isOutOfStock 
                    ? '❌ Out of Stock' 
                    : '🛒 Buy Now'}
        </button>
      </div>
    </div>
  );
}
