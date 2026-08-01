"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Search, 
  X,
  Boxes,
  UploadCloud,
  Camera
} from "lucide-react";
import { BulkUploadModal } from "./BulkUploadModal";
import { usePhysicalBarcodeScanner } from "@/lib/usePhysicalBarcodeScanner";
import { useScannerStore } from "@/lib/store/useScannerStore";

export function InventoryView() {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalItemsCount: 0,
    totalStockQty: 0,
    totalStockValuation: 0,
    totalRetailValuation: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState<any>(null); // item object when editing stock
  const openScanner = useScannerStore(s => s.openScanner);

  // Add Item Form State
  const [newItem, setNewItem] = useState({
    sku: "",
    name: "",
    category: "General",
    unit: "Pcs",
    hsnCode: "8517",
    salePrice: "",
    purchasePrice: "",
    taxRate: "18",
    stockQty: "",
    lowStockThreshold: "10",
  });

  // Adjust Stock Form State
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNotes, setAdjustNotes] = useState("");

  usePhysicalBarcodeScanner((barcode) => {
    if (showAddModal) {
      setNewItem(prev => ({ ...prev, sku: barcode }));
    } else if (!showAdjustModal && !showBulkUploadModal) {
      // If we are in the main view, search for the item
      const found = items.find(i => i.sku === barcode || i.id === barcode);
      if (found) {
        setSearch(barcode);
        setShowAdjustModal(found); // Open adjust modal immediately for speed
      } else {
        // If not found, open the "Add New Item" modal prefilled with this barcode
        setNewItem(prev => ({ ...prev, sku: barcode }));
        setShowAddModal(true);
      }
    }
  }, true); // Keep always active to support scanning from the main screen

  const loadItems = async () => {
    try {
      setLoading(true);
      const url = `/api/items?search=${encodeURIComponent(search)}${filterLowStock ? "&lowStock=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items || []);
      setSummary(data.summary || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [search, filterLowStock]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewItem({
          sku: "",
          name: "",
          category: "General",
          unit: "Pcs",
          hsnCode: "8517",
          salePrice: "",
          purchasePrice: "",
          taxRate: "18",
          stockQty: "",
          lowStockThreshold: "10",
        });
        loadItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjustModal) return;
    try {
      const res = await fetch(`/api/items/${showAdjustModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adjustStock: adjustQty,
          adjustNotes: adjustNotes || "Manual stock update",
        }),
      });
      if (res.ok) {
        setShowAdjustModal(null);
        setAdjustQty("");
        setAdjustNotes("");
        loadItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1f2029] tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#6730e3]" /> Inventory & Stock Management
          </h1>
          <p className="text-xs text-[#999] mt-1">
            Real-time stock valuation, low-stock notifications, HSN tax rates, and SKU movement logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#f8f9fa] hover:bg-[#f0f0f0] text-[#333] border border-[#e0d5ff] flex items-center gap-2 transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" /> Bulk Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#6730e3] hover:bg-[#6730e3] text-[#1f2029] shadow-lg shadow-[#6730e340] flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Item
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e8ecf1] rounded-2xl p-4 shadow-lg">
          <span className="text-xs font-semibold text-[#999] uppercase">Total Items</span>
          <div className="text-2xl font-black text-[#1f2029] mt-1">{summary.totalItemsCount || 0}</div>
          <p className="text-[11px] text-[#999] mt-0.5">{summary.totalStockQty || 0} Total Units in Stock</p>
        </div>

        <div className="bg-white border border-[#e8ecf1] rounded-2xl p-4 shadow-lg">
          <span className="text-xs font-semibold text-[#999] uppercase">Stock Valuation (Cost)</span>
          <div className="text-2xl font-black text-[#6730e3] mt-1">
            ₹{(summary.totalStockValuation || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[#999] mt-0.5">Based on purchase prices</p>
        </div>

        <div className="bg-white border border-[#e8ecf1] rounded-2xl p-4 shadow-lg">
          <span className="text-xs font-semibold text-[#999] uppercase">Retail Value (Sale)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ₹{(summary.totalRetailValuation || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[#999] mt-0.5">Potential revenue value</p>
        </div>

        <div className="bg-white border border-amber-500/30 rounded-2xl p-4 shadow-lg bg-amber-500/5">
          <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">{summary.lowStockCount || 0}</div>
          <p className="text-[11px] text-amber-300/80 mt-0.5">Items below threshold limit</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#e8ecf1] p-3 rounded-2xl">
        <div className="relative w-full sm:w-80 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#999] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#333] placeholder-[#aaa] focus:outline-none focus:border-[#6730e3]"
            />
          </div>
          <button
            onClick={() => openScanner((barcode) => {
              const found = items.find(i => i.sku === barcode || i.id === barcode);
              if (found) {
                setSearch(barcode);
                setShowAdjustModal(found);
              } else {
                setNewItem(prev => ({ ...prev, sku: barcode }));
                setShowAddModal(true);
              }
            })}
            className="px-3 py-2 rounded-xl text-[#6730e3] bg-[#6730e3]/10 hover:bg-[#6730e3]/20 transition-colors flex items-center justify-center flex-shrink-0"
            title="Scan Barcode to Search or Add"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterLowStock(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !filterLowStock
                ? "bg-[#6730e3] text-[#1f2029] shadow-md shadow-[#6730e330]"
                : "bg-[#f8f9fa] text-[#999] hover:text-[#333]"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterLowStock(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterLowStock
                ? "bg-amber-600 text-[#1f2029] shadow-md shadow-amber-600/20"
                : "bg-[#f8f9fa] text-amber-400 hover:bg-[#f0f0f0]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Only ({summary.lowStockCount || 0})
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white border border-[#e8ecf1] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#999]">Loading stock items...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-[#999]">
            <Boxes className="w-10 h-10 mx-auto text-[#ccc] mb-2" />
            <p className="text-xs font-medium">No inventory items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-[#999] bg-[#fafbfc] border-b border-[#e8ecf1] uppercase tracking-wider">
                  <th className="py-3 px-4">Item Name / SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">HSN & Tax</th>
                  <th className="py-3 px-4">Sale Price</th>
                  <th className="py-3 px-4">Purchase Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] text-xs">
                {items.map((item) => {
                  const isLow = item.stockQty <= item.lowStockThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1f2029]">{item.name}</div>
                        <div className="text-[10px] font-mono text-[#6730e3]">{item.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#666]">
                        <span className="px-2 py-0.5 rounded bg-[#f8f9fa] text-[10px] text-[#666] font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#666]">
                        <div>HSN: {item.hsnCode}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">{item.taxRate}% GST</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1f2029]">
                        ₹{item.salePrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-[#999]">
                        ₹{item.purchasePrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                              isLow
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {item.stockQty} {item.unit}
                          </span>
                          {isLow && (
                            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setShowAdjustModal(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f8f9fa] hover:bg-[#f0f0f0] text-[#6730e3] border border-[#e0d5ff] transition-all"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8ecf1] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
            <div className="p-5 border-b border-[#e8ecf1] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1f2029] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#6730e3]" /> Add New Inventory Item
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#999] hover:text-[#1f2029]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WiFi Router"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                  />
                </div>
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">SKU / Item Code</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={newItem.sku}
                      onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                      className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                    />
                    <button
                      type="button"
                      onClick={() => openScanner((barcode) => {
                        setNewItem(prev => ({ ...prev, sku: barcode }));
                      })}
                      className="p-2.5 rounded-xl bg-[#f8f9fa] border border-[#e8ecf1] text-[#6730e3] hover:bg-[#6730e3] hover:text-white transition-colors flex-shrink-0"
                      title="Scan Barcode"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Category</label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                  />
                </div>
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">HSN Code</label>
                  <input
                    type="text"
                    value={newItem.hsnCode}
                    onChange={(e) => setNewItem({ ...newItem, hsnCode: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                  />
                </div>
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Unit (Pcs/Kg/Box)</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="2499"
                    value={newItem.salePrice}
                    onChange={(e) => setNewItem({ ...newItem, salePrice: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                  />
                </div>
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1650"
                    value={newItem.purchasePrice}
                    onChange={(e) => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                  />
                </div>
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">GST Rate (%)</label>
                  <select
                    value={newItem.taxRate}
                    onChange={(e) => setNewItem({ ...newItem, taxRate: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Opening Stock Qty</label>
                  <input
                    type="number"
                    placeholder="45"
                    value={newItem.stockQty}
                    onChange={(e) => setNewItem({ ...newItem, stockQty: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                  />
                </div>
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Low Stock Threshold</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newItem.lowStockThreshold}
                    onChange={(e) => setNewItem({ ...newItem, lowStockThreshold: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#e8ecf1]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f8f9fa] text-[#666] hover:bg-[#f0f0f0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6730e3] hover:bg-[#6730e3] text-[#1f2029] font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8ecf1] rounded-2xl w-full max-w-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
            <div className="p-5 border-b border-[#e8ecf1] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1f2029]">Adjust Stock Quantity</h3>
                <p className="text-xs text-[#6730e3]">{showAdjustModal.name}</p>
              </div>
              <button onClick={() => setShowAdjustModal(null)} className="text-[#999] hover:text-[#1f2029]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e8ecf1] flex items-center justify-between">
                <span className="text-[#999]">Current Stock Level:</span>
                <span className="text-sm font-bold text-emerald-400">{showAdjustModal.stockQty} {showAdjustModal.unit}</span>
              </div>

              <div>
                <label className="block text-[#999] mb-1 font-semibold">
                  Add / Reduce Stock Qty (+5 or -3) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. +10 or -5"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-mono text-sm focus:outline-none focus:border-[#6730e3]"
                />
              </div>

              <div>
                <label className="block text-[#999] mb-1 font-semibold">Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. New shipment received from vendor"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#e8ecf1]">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#f8f9fa] text-[#666] hover:bg-[#f0f0f0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6730e3] hover:bg-[#6730e3] text-[#1f2029] font-bold"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUploadModal 
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={() => {
            setShowBulkUploadModal(false);
            loadItems();
          }}
        />
      )}
    </div>
  );
}
