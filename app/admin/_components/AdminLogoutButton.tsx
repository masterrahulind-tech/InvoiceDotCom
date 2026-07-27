"use client";

import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
    >
      <LogOut className="w-5 h-5" />
      <span className="font-medium text-sm">Logout</span>
    </button>
  );
}
