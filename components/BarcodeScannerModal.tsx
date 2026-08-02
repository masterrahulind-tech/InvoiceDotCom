"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, RefreshCcw } from "lucide-react";
import { useScannerStore } from "@/lib/store/useScannerStore";

export function GlobalBarcodeScanner() {
  const { isOpen, closeScanner, onScan } = useScannerStore();
  const [cameras, setCameras] = useState<any[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (html5QrCode.current) {
        try {
          html5QrCode.current.stop().then(() => {
            html5QrCode.current?.clear();
            html5QrCode.current = null;
          }).catch(err => {
            console.error("Failed to stop scanner", err);
          });
        } catch (err) {
          console.error("Sync error stopping scanner:", err);
          try { html5QrCode.current?.clear(); } catch(e) {}
          html5QrCode.current = null;
        }
      }
      return;
    }

    // Initialize scanner when modal opens
    setIsStarting(true);
    setError(null);
    
    try {
      if (typeof Html5Qrcode === 'undefined') {
        throw new Error("Html5Qrcode library failed to load");
      }
      
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length) {
            setCameras(devices);
            // Prefer back camera if available, otherwise first camera
            const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
            const selectedCam = backCamera ? backCamera.id : devices[0].id;
            setCurrentCameraId(selectedCam);
            startScanner(selectedCam);
          } else {
            setError("No cameras found on your device.");
            setIsStarting(false);
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setError("Camera permission denied or not available.");
          setIsStarting(false);
        });
    } catch (err: any) {
      console.error("Sync error starting camera fetch:", err);
      setError("Camera system error: " + (err.message || "Library failed to initialize"));
      setIsStarting(false);
    }

    return () => {
      if (html5QrCode.current) {
        try {
          html5QrCode.current.stop().then(() => {
            html5QrCode.current?.clear();
            html5QrCode.current = null;
          }).catch(e => console.error("Failed to stop on unmount", e));
        } catch (err) {
          console.error("Sync error stopping on unmount:", err);
          try { html5QrCode.current?.clear(); } catch(e) {}
          html5QrCode.current = null;
        }
      }
    };
  }, [isOpen]);

  const startScanner = (cameraId: string) => {
    if (html5QrCode.current) {
      // If already running, stop it first
      try {
        html5QrCode.current.stop().then(() => {
          html5QrCode.current?.clear();
          initScanner(cameraId);
        }).catch(e => {
          console.error("Failed to stop scanner before restarting", e);
          initScanner(cameraId); // try anyway
        });
      } catch (err) {
        console.error("Sync error stopping before restart:", err);
        try { html5QrCode.current?.clear(); } catch(e) {}
        initScanner(cameraId);
      }
    } else {
      initScanner(cameraId);
    }
  };

  const initScanner = (cameraId: string) => {
    setIsStarting(true);
    try {
      html5QrCode.current = new Html5Qrcode("global-qr-reader");
      html5QrCode.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          // Success
          if (onScan) {
            onScan(decodedText);
          }
          closeScanner();
        },
        (errorMessage) => {
          // Continuous error during scanning, usually safe to ignore
        }
      ).then(() => {
        setIsStarting(false);
      }).catch((err) => {
        console.error("Scanner start error:", err);
        setError("Could not start video stream. Please ensure camera is not in use by another app.");
        setIsStarting(false);
      });
    } catch (err) {
      console.error("Sync error initializing scanner:", err);
      setError("Failed to initialize the barcode scanner.");
      setIsStarting(false);
    }
  };

  const handleFlipCamera = () => {
    if (cameras.length > 1 && currentCameraId) {
      const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCameraId = cameras[nextIndex].id;
      setCurrentCameraId(nextCameraId);
      startScanner(nextCameraId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#6730e3]" /> Scan Barcode
          </h3>
          <div className="flex items-center gap-3">
            {cameras.length > 1 && (
              <button
                onClick={handleFlipCamera}
                className="text-gray-500 hover:text-[#6730e3] transition-colors flex items-center gap-1 text-xs font-semibold bg-gray-100 px-3 py-1.5 rounded-full"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Flip
              </button>
            )}
            <button
              onClick={closeScanner}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 relative">
          {error ? (
            <div className="text-center p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <p className="font-semibold mb-2">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 border-dashed border-[#6730e3]/40 min-h-[250px] flex items-center justify-center">
              <div id="global-qr-reader" className="absolute inset-0 w-full h-full"></div>
              {isStarting && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white text-sm animate-pulse bg-black/50 backdrop-blur-sm">
                  <Camera className="w-8 h-8 mb-2 opacity-50" />
                  Starting Camera...
                </div>
              )}
            </div>
          )}
          
          <p className="text-center text-xs text-gray-500 mt-4">
            Point your camera at a barcode or QR code to scan.
          </p>
        </div>
      </div>
    </div>
  );
}
