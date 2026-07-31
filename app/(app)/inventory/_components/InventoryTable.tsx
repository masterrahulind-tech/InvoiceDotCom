"use client";

import { useState } from "react";
import { Package, Search, Filter, Printer } from "lucide-react";
import { PrintBarcodeModal } from "./PrintBarcodeModal";

export function InventoryTable({ items }: { items: any[] }) {
  const [printItem, setPrintItem] = useState<any>(null);
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-12 text-center">
        <div className="rounded-full bg-gray-50 p-4 mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No inventory items found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding items manually or using the bulk import tool.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="h-9 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <button className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Item Details</th>
              <th className="px-4 py-3 font-medium">Category / Unit</th>
              <th className="px-4 py-3 font-medium text-right">Purchase Price</th>
              <th className="px-4 py-3 font-medium text-right">Sale Price</th>
              <th className="px-4 py-3 font-medium text-right">Stock</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div>{item.category}</div>
                  <div className="text-xs text-gray-400">per {item.unit}</div>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  ₹{item.purchasePrice?.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  ₹{item.salePrice?.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {item.stockQty}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.stockQty <= item.lowStockThreshold ? (
                    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      LOW STOCK
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      IN STOCK
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => setPrintItem(item)}
                    className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                    title="Print Barcode Labels"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination stub */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 flex justify-between items-center">
        <span>Showing {items.length} items</span>
      </div>

      <PrintBarcodeModal 
        isOpen={!!printItem} 
        onClose={() => setPrintItem(null)} 
        item={printItem} 
      />
    </div>
  );
}
