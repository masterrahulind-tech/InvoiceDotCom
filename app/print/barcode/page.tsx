"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Barcode from "react-barcode";

function PrintBarcodeContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Give it a short delay to render the barcode before triggering print dialog
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const sku = searchParams.get("sku") || "";
  const name = searchParams.get("name") || "";
  const price = searchParams.get("price") || "";
  const qty = parseInt(searchParams.get("qty") || "1", 10);

  const labels = Array.from({ length: Math.max(1, qty) });

  if (!sku) {
    return <div className="p-4 font-sans">No SKU provided for printing. Please go back.</div>;
  }

  return (
    <div className="print-container font-sans text-black">
      <style jsx global>{`
        @page {
          size: 50mm 25mm; /* Standard thermal label size */
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background: white;
          width: 50mm;
        }
        @media print {
          html, body {
            width: 50mm !important;
            height: 25mm !important;
            overflow: hidden;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
      
      {labels.map((_, i) => (
        <div 
          key={i} 
          className={`flex flex-col items-center justify-between w-[50mm] h-[25mm] bg-white overflow-hidden ${i < labels.length - 1 ? 'page-break' : ''}`}
          style={{ boxSizing: 'border-box', padding: '1mm 2mm' }}
        >
          {name && (
            <div className="text-[10px] font-bold text-center leading-tight truncate w-full px-1 mt-0.5">
              {name}
            </div>
          )}
          
          <div className="flex-1 flex items-center justify-center -my-1">
            <Barcode 
              value={sku} 
              format="CODE128" 
              width={1.2} 
              height={32} 
              fontSize={11} 
              margin={2} 
              displayValue={true} 
            />
          </div>
          
          {price && (
            <div className="text-[11px] font-bold pb-0.5">
              ₹{price}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PrintBarcodePage() {
  return (
    <Suspense fallback={<div className="p-4 font-sans">Loading barcode data...</div>}>
      <PrintBarcodeContent />
    </Suspense>
  );
}
