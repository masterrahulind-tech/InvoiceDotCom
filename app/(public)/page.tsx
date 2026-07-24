"use client";

import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    fetch("/landing.html")
      .then((res) => res.text())
      .then((text) => {
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const body = bodyMatch ? bodyMatch[1] : text;
        setHtmlContent(body.replace(/\r\n/g, "\n"));
      })
      .catch((err) => console.error("Failed to load landing.html", err));
  }, []);

  if (!mounted || !htmlContent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white" suppressHydrationWarning>
        <div className="animate-pulse font-sans text-sm font-semibold">Loading AppCo...</div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning={true}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
