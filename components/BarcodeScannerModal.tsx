"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X, Camera } from "lucide-react";

interface BarcodeScannerModalProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScannerModal({ onScan, onClose }: BarcodeScannerModalProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Make sure we only initialize once
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 150 } },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          // On success
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
          onScan(decodedText);
        },
        (error) => {
          // On error (happens continuously as it scans, ignore usually)
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#6730e3]" /> Scan Barcode
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 bg-gray-50">
          <div id="qr-reader" className="w-full bg-white rounded-xl overflow-hidden border-2 border-dashed border-gray-300"></div>
          <p className="text-center text-xs text-gray-500 mt-4">
            Point your camera at a barcode or QR code to scan.
          </p>
        </div>
      </div>
    </div>
  );
}
