'use client';

import React, { useEffect, useRef } from 'react';

interface InvoiceRect {
  x: number;
  y: number;
  width: number;
  height: number;
  speedY: number;
  opacity: number;
  scale: number;
  lines: number;
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let invoices: InvoiceRect[] = [];
    
    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Create a new background invoice "blueprint"
    const createInvoice = (): InvoiceRect => {
      const width = Math.random() * 100 + 80; // 80 to 180px
      const height = width * 1.414; // A4 ratio
      return {
        x: Math.random() * (canvas.width - width),
        y: canvas.height + 100, // Start below screen
        width,
        height,
        speedY: Math.random() * 0.8 + 0.2,
        opacity: 0,
        scale: Math.random() * 0.5 + 0.5,
        lines: Math.floor(Math.random() * 5) + 3,
      };
    };

    // Initial populate
    for (let i = 0; i < 8; i++) {
      const inv = createInvoice();
      inv.y = Math.random() * canvas.height;
      invoices.push(inv);
    }

    const render = () => {
      // Clear canvas with a subtle gradient effect
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw invoices
      for (let i = 0; i < invoices.length; i++) {
        const inv = invoices[i];
        
        // Move up
        inv.y -= inv.speedY;
        
        // Fade in/out logic
        if (inv.y > canvas.height - 100) {
          inv.opacity = Math.min(inv.opacity + 0.01, 0.25); // Fade in
        } else if (inv.y < 200) {
          inv.opacity = Math.max(inv.opacity - 0.005, 0); // Fade out at top
        } else {
          inv.opacity = 0.25; // Max opacity
        }

        // Draw the blueprint invoice
        ctx.save();
        ctx.translate(inv.x, inv.y);
        ctx.scale(inv.scale, inv.scale);
        
        // Blueprint styling (Primary Brand Color: #003d9b, but lighter for background)
        ctx.strokeStyle = `rgba(0, 61, 155, ${inv.opacity})`;
        ctx.lineWidth = 1.5;
        
        // Draw main border
        ctx.strokeRect(0, 0, inv.width, inv.height);
        
        // Draw inner lines (mimicking text/invoice rows)
        ctx.beginPath();
        const padding = 15;
        const lineSpacing = (inv.height - padding * 2) / (inv.lines + 2);
        
        // Header line
        ctx.moveTo(padding, padding);
        ctx.lineTo(inv.width * 0.5, padding);
        
        // Rows
        for (let j = 0; j < inv.lines; j++) {
          const lineY = padding + lineSpacing * (j + 2);
          ctx.moveTo(padding, lineY);
          ctx.lineTo(inv.width - padding, lineY);
        }
        
        // Footer line
        ctx.moveTo(inv.width * 0.4, inv.height - padding);
        ctx.lineTo(inv.width - padding, inv.height - padding);
        
        ctx.stroke();
        ctx.restore();

        // Remove if off screen and replace
        if (inv.y + inv.height * inv.scale < -100 || inv.opacity <= 0 && inv.y < 200) {
          invoices[i] = createInvoice();
        }
      }

      // Add a subtle scanline or noise overlay effect if desired, 
      // but keeping it clean for performance.

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-gradient-to-b from-surface-bright to-[#edeef0]">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60 mix-blend-multiply blur-[2px]"
      />
    </div>
  );
}
