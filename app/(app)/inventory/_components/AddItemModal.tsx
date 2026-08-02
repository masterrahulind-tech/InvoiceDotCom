"use client";

import { useState, useEffect } from "react";
import { X, Check, Camera } from "lucide-react";
import { usePhysicalBarcodeScanner } from "@/lib/usePhysicalBarcodeScanner";
import { useScannerStore } from "@/lib/store/useScannerStore";

export function AddItemModal({
  isOpen,
  onClose,
  onSuccess,
  initialSku,
  editingItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialSku?: string;
  editingItem?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const openScanner = useScannerStore(s => s.openScanner);

  // Physical Barcode Scanner support for SKU
  usePhysicalBarcodeScanner((barcode) => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, sku: barcode }));
    }
  }, isOpen);

  const [formData, setFormData] = useState({
    name: "",
    sku: initialSku || "",
    category: "General",
    unit: "Pcs",
    hsnCode: "",
    mrp: "",
    salePrice: "",
    purchasePrice: "",
    taxRate: "18",
    stockQty: "0",
    lowStockThreshold: "10",
  });

  // When initialSku changes or modal opens, update sku
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          name: editingItem.name || "",
          sku: editingItem.sku || "",
          category: editingItem.category || "General",
          unit: editingItem.unit || "Pcs",
          hsnCode: editingItem.hsnCode || "",
          mrp: editingItem.mrp ? String(editingItem.mrp) : "",
          salePrice: editingItem.salePrice ? String(editingItem.salePrice) : "",
          purchasePrice: editingItem.purchasePrice ? String(editingItem.purchasePrice) : "",
          taxRate: editingItem.taxRate ? String(editingItem.taxRate) : "18",
          stockQty: editingItem.stockQty ? String(editingItem.stockQty) : "0",
          lowStockThreshold: editingItem.lowStockThreshold ? String(editingItem.lowStockThreshold) : "10",
        });
      } else {
        setFormData(prev => ({
          ...prev,
          name: "",
          sku: initialSku || "",
          category: "General",
          unit: "Pcs",
          hsnCode: "",
          mrp: "",
          salePrice: "",
          purchasePrice: "",
          taxRate: "18",
          stockQty: "0",
          lowStockThreshold: "10",
        }));
      }
      setError("");
    }
  }, [isOpen, initialSku, editingItem]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : "/api/items";
      const method = editingItem ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mrp: formData.mrp ? Number(formData.mrp) : null,
          salePrice: Number(formData.salePrice),
          purchasePrice: Number(formData.purchasePrice),
          taxRate: Number(formData.taxRate),
          stockQty: Number(formData.stockQty),
          lowStockThreshold: Number(formData.lowStockThreshold),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || `Failed to ${editingItem ? "update" : "create"} item`);
      } else {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: "",
          sku: "",
          category: "General",
          unit: "Pcs",
          hsnCode: "",
          mrp: "",
          salePrice: "",
          purchasePrice: "",
          taxRate: "18",
          stockQty: "0",
          lowStockThreshold: "10",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[95vw] sm:max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {editingItem ? "Edit Item" : "Add New Item"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form id="add-item-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Item Name *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g. Apple iPhone 15"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">SKU / Code</label>
                <div className="flex gap-2">
                  <input
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="e.g. IPH15"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner((barcode) => {
                      setFormData(prev => ({ ...prev, sku: barcode }));
                    })}
                    className="px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center flex-shrink-0"
                    title="Scan Barcode"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">MRP (₹)</label>
                <input
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Sale Price (₹) *</label>
                <input
                  required
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Purchase Price (₹)</label>
                <input
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                <select
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">HSN Code</label>
                <input
                  name="hsnCode"
                  value={formData.hsnCode}
                  onChange={handleChange}
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Unit</label>
                <input
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Opening Stock</label>
                <input
                  name="stockQty"
                  value={formData.stockQty}
                  onChange={handleChange}
                  type="number"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Low Stock Alert</label>
                <input
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  type="number"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </form>
        </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 p-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-item-form"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {loading ? "Saving..." : (editingItem ? "Update Item" : "Save Item")}
              </button>
            </div>
      </div>
    </div>
  );
}
