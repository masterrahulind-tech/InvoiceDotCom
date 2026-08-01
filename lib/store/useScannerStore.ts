import { create } from 'zustand';

interface ScannerState {
  isOpen: boolean;
  onScan: ((barcode: string) => void) | null;
  openScanner: (onScan: (barcode: string) => void) => void;
  closeScanner: () => void;
}

export const useScannerStore = create<ScannerState>((set) => ({
  isOpen: false,
  onScan: null,
  openScanner: (callback) => set({ isOpen: true, onScan: callback }),
  closeScanner: () => set({ isOpen: false, onScan: null }),
}));
