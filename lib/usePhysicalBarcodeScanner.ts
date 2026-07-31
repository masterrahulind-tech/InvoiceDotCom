import { useEffect, useRef } from "react";

export function usePhysicalBarcodeScanner(onScan: (barcode: string) => void, active: boolean = true) {
  const buffer = useRef<string>("");
  const lastKeyTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const currentTime = Date.now();
      
      // If time since last keystroke is too long (e.g. > 50ms), assume manual typing and clear buffer
      // Physical barcode scanners usually send characters within 10-30ms of each other.
      if (currentTime - lastKeyTime.current > 50) {
        buffer.current = "";
      }

      lastKeyTime.current = currentTime;

      // Handle Enter key, which usually signifies the end of a scan
      if (e.key === "Enter") {
        if (buffer.current.length > 3) {
          onScan(buffer.current);
          buffer.current = "";
          e.preventDefault(); // Prevent default enter behavior if it was a scan
        }
        return;
      }

      // Append printable characters to the buffer
      if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan, active]);
}
