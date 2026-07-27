"use client";

import React, { useState } from "react";
import { UploadCloud, X, FileText, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface BulkUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUploadModal({ onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ imported: number; failed: number; errors: any[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setParsedData([]);
      setSuccess(null);
      parseFile(selected);
    }
  };

  const parseFile = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    
    if (ext === "csv") {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
        },
        error: (err: any) => {
          setError(`CSV Parsing Error: ${err.message}`);
        }
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          setParsedData(json);
        } catch (err: any) {
          setError(`Excel Parsing Error: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setError("Invalid file format. Please upload a .csv, .xls, or .xlsx file.");
    }
  };

  const mapDataForUpload = (data: any[]) => {
    return data.map((row: any) => ({
      name: row.name || row.Name || row.ItemName || row["Item Name"],
      sku: row.sku || row.SKU || row.ItemCode || row["Item Code"] || "",
      category: row.category || row.Category || "General",
      unit: row.unit || row.Unit || "Pcs",
      hsnCode: String(row.hsnCode || row.HSN || row.HSNCode || row["HSN Code"] || ""),
      salePrice: parseFloat(row.salePrice || row.SalePrice || row["Sale Price"]) || 0,
      purchasePrice: parseFloat(row.purchasePrice || row.PurchasePrice || row["Purchase Price"]) || 0,
      taxRate: parseFloat(row.taxRate || row.GST || row.TaxRate || row["Tax Rate"] || row["GST Rate"]) || 18,
      stockQty: parseFloat(row.stockQty || row.Stock || row.Qty || row.Quantity || row["Stock Qty"]) || 0,
      lowStockThreshold: parseFloat(row.lowStockThreshold || row.LowStock || row.Threshold || row["Low Stock Threshold"]) || 10,
    }));
  };

  const handleDownloadTemplate = (format: "csv" | "xlsx") => {
    const templateData = [
      {
        "Item Name": "Sample Product A",
        "SKU": "SKU-001",
        "Category": "Electronics",
        "Unit": "Pcs",
        "HSN Code": "8517",
        "Sale Price": 500,
        "Purchase Price": 350,
        "GST Rate": 18,
        "Stock Qty": 100,
        "Low Stock Threshold": 10
      },
      {
        "Item Name": "Sample Product B",
        "SKU": "SKU-002",
        "Category": "Accessories",
        "Unit": "Box",
        "HSN Code": "4819",
        "Sale Price": 150,
        "Purchase Price": 100,
        "GST Rate": 12,
        "Stock Qty": 50,
        "Low Stock Threshold": 5
      }
    ];

    if (format === "csv") {
      const csv = Papa.unparse(templateData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "inventory_template.csv";
      link.click();
    } else {
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      XLSX.writeFile(workbook, "inventory_template.xlsx");
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const payload = mapDataForUpload(parsedData);
      
      // Basic validation
      if (payload.some(item => !item.name)) {
        throw new Error("One or more items are missing a Name. Please check your file.");
      }

      const res = await fetch("/api/items/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload items.");
      }

      setSuccess({
        imported: data.imported,
        failed: data.failed,
        errors: data.errors
      });
      
      if (data.imported > 0) {
        onSuccess(); // Refresh the list behind the modal
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#e8ecf1] rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.12)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#e8ecf1] flex items-center justify-between shrink-0">
          <h3 className="text-lg font-bold text-[#1f2029] flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#6730e3]" /> Bulk Upload Inventory
          </h3>
          <button onClick={onClose} className="text-[#999] hover:text-[#1f2029]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {!success ? (
            <>
              {/* Instructions */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 space-y-3">
                <div>
                  <p className="font-semibold mb-1">Upload a CSV or Excel (.xlsx) file to add multiple items at once.</p>
                  <p className="text-indigo-700">Supported columns: <span className="font-mono bg-indigo-100 px-1 rounded">Item Name*, SKU, Category, Unit, HSN Code, Sale Price, Purchase Price, GST Rate, Stock Qty, Low Stock Threshold</span></p>
                </div>
                
                <div className="flex items-center gap-3 pt-2 border-t border-indigo-200/50">
                  <span className="font-semibold">Download Sample Format:</span>
                  <button 
                    onClick={() => handleDownloadTemplate("csv")}
                    className="flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2 py-1 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV Template
                  </button>
                  <button 
                    onClick={() => handleDownloadTemplate("xlsx")}
                    className="flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2 py-1 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Excel Template
                  </button>
                </div>
              </div>

              {/* File Input */}
              <div className="relative border-2 border-dashed border-[#e8ecf1] rounded-2xl p-8 text-center hover:bg-[#f8f9fa] transition-colors">
                <input 
                  type="file" 
                  accept=".csv, .xls, .xlsx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <FileText className="w-8 h-8 text-[#999]" />
                  {file ? (
                    <span className="font-bold text-[#6730e3]">{file.name}</span>
                  ) : (
                    <span className="font-medium text-[#666]">Click or drag file to upload</span>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Data Preview */}
              {parsedData.length > 0 && !error && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#1f2029]">Data Preview (First 3 rows)</h4>
                  <div className="overflow-x-auto border border-[#e8ecf1] rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-[#f8f9fa] text-[#666]">
                        <tr>
                          {Object.keys(parsedData[0]).slice(0, 6).map(key => (
                            <th key={key} className="py-2 px-3 font-semibold">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e8ecf1]">
                        {parsedData.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).slice(0, 6).map((val: any, j) => (
                              <td key={j} className="py-2 px-3 text-[#333]">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-[#999] text-right">
                    Total {parsedData.length} items found.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <div>
                <h4 className="text-xl font-bold text-[#1f2029]">Upload Complete!</h4>
                <p className="text-[#666] mt-1">Successfully imported <span className="font-bold text-emerald-600">{success.imported}</span> items.</p>
              </div>

              {success.failed > 0 && (
                <div className="mt-6 text-left border border-rose-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-rose-50 px-4 py-2 font-bold text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {success.failed} Items Failed
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-rose-100 bg-white">
                    {success.errors.map((err, idx) => (
                      <div key={idx} className="p-3 text-rose-600">
                        <span className="font-semibold">Row {err.row} ({err.item}):</span> {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#e8ecf1] flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#f8f9fa] text-[#666] font-semibold hover:bg-[#f0f0f0]"
          >
            {success ? "Close" : "Cancel"}
          </button>
          {!success && (
            <button
              onClick={handleUpload}
              disabled={parsedData.length === 0 || loading}
              className="px-5 py-2.5 rounded-xl bg-[#6730e3] hover:bg-[#5b29c9] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Upload {parsedData.length > 0 ? parsedData.length : ""} Items
                </>
              )}
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}
