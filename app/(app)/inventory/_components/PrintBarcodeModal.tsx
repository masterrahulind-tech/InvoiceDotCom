"use client";

import { useState } from "react";
import { X, Printer } from "lucide-react";

export function PrintBarcodeModal({
  isOpen,
  onClose,
  item
}: {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}) {
  const [qty, setQty] = useState(1);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    // Generate URL for print route
    const params = new URLSearchParams({
      sku: item.sku || item.id,
      name: item.name || "",
      price: (item.salePrice || 0).toString(),
      qty: qty.toString()
    });
    
    window.open(`/print/barcode?${params.toString()}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-gray-400" />
            Print Barcode
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Item:</p>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-500 mt-1">SKU: {item.sku || item.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Labels to Print</label>
            <div className="flex items-center">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-50 text-gray-600"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                className="w-16 h-10 border-y border-gray-300 text-center focus:outline-none"
              />
              <button 
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-50 text-gray-600"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Labels are formatted for standard 50mm x 25mm thermal paper.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Generate Labels
          </button>
        </div>
      </div>
    </div>
  );
}
