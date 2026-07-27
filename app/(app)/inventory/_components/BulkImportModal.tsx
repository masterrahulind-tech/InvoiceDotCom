"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, X, FileSpreadsheet, Check, AlertCircle } from "lucide-react";

export function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setErrors([]);

    const extension = uploadedFile.name.split(".").pop()?.toLowerCase();

    if (extension === "csv") {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processParsedData(results.data),
      });
    } else if (extension === "xlsx" || extension === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processParsedData(data);
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      setErrors(["Unsupported file type. Please upload .csv or .xlsx"]);
    }
  };

  const processParsedData = (data: any[]) => {
    // Map human-readable headers to database schema keys
    const mappedData = data.map((row) => ({
      name: row["Name"] || row["Item Name"] || row["name"],
      sku: row["SKU"] || row["sku"] || "",
      category: row["Category"] || row["category"] || "General",
      unit: row["Unit"] || row["unit"] || "Pcs",
      hsnCode: String(row["HSN Code"] || row["HSN"] || row["hsnCode"] || ""),
      salePrice: parseFloat(row["Sale Price"] || row["salePrice"]) || 0,
      purchasePrice: parseFloat(row["Purchase Price"] || row["purchasePrice"]) || 0,
      taxRate: parseFloat(row["Tax Rate"] || row["taxRate"]) || 0,
      stockQty: parseFloat(row["Stock Qty"] || row["stockQty"]) || 0,
      lowStockThreshold: parseFloat(row["Low Stock Alert"] || row["lowStockThreshold"]) || 10,
    }));

    // Basic validation
    const newErrors: string[] = [];
    mappedData.forEach((item, index) => {
      if (!item.name) newErrors.push(`Row ${index + 1}: Name is required`);
      if (item.salePrice < 0) newErrors.push(`Row ${index + 1}: Sale Price cannot be negative`);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setParsedData(mappedData);
    }
  };

  const handleSubmit = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrors([errorData.error || "Failed to import data"]);
      } else {
        onSuccess();
        onClose();
      }
    } catch (error) {
      setErrors(["An unexpected error occurred."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Bulk Import Inventory</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!file && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-10 text-center transition-colors hover:border-gray-300 hover:bg-gray-100">
              <Upload className="mb-4 h-10 w-10 text-gray-400" />
              <p className="mb-1 font-medium text-gray-900">Click to upload CSV or Excel file</p>
              <p className="mb-6 text-sm text-gray-500">Maximum file size: 5MB</p>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Select File
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="mt-8 border-t border-gray-200 pt-6 w-full max-w-sm">
                <div className="flex items-center justify-center gap-6">
                  <a 
                    href="/api/inventory/template?type=csv" 
                    className="flex flex-col items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                  >
                    <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    Sample CSV
                  </a>
                  <a 
                    href="/api/inventory/template?type=xlsx" 
                    className="flex flex-col items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                  >
                    <div className="rounded-full bg-green-50 p-3 text-green-600">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    Sample Excel
                  </a>
                </div>
              </div>
            </div>
          )}

          {file && (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setParsedData([]); setErrors([]); }}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              {errors.length > 0 && (
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                    <AlertCircle className="h-5 w-5" />
                    Validation Errors Found
                  </div>
                  <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                    {errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                    {errors.length > 5 && <li>...and {errors.length - 5} more errors.</li>}
                  </ul>
                </div>
              )}

              {parsedData.length > 0 && errors.length === 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Preview Data</h3>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {parsedData.length} valid items
                    </span>
                  </div>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-[250px]">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 font-medium">Name</th>
                            <th className="px-4 py-2 font-medium">Category</th>
                            <th className="px-4 py-2 font-medium text-right">Price</th>
                            <th className="px-4 py-2 font-medium text-right">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {parsedData.slice(0, 5).map((item, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 text-gray-900 truncate max-w-[150px]">{item.name}</td>
                              <td className="px-4 py-2 text-gray-600">{item.category}</td>
                              <td className="px-4 py-2 text-gray-900 text-right">₹{item.salePrice}</td>
                              <td className="px-4 py-2 text-gray-900 text-right">{item.stockQty} {item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedData.length > 5 && (
                      <div className="bg-gray-50 px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-200">
                        Showing 5 of {parsedData.length} items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50">
          <button 
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!file || parsedData.length === 0 || errors.length > 0 || loading}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              "Importing..."
            ) : (
              <>
                <Check className="h-4 w-4" />
                Import {parsedData.length > 0 ? `${parsedData.length} Items` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
