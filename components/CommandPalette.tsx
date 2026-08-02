"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  Wallet, 
  FilePieChart, 
  Settings,
  Plus
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
        <Command
          className="flex h-full w-full flex-col overflow-hidden bg-white text-gray-900"
          shouldFilter={true}
        >
          <div className="flex items-center border-b border-gray-100 px-3">
            <Command.Input 
              placeholder="Type a command or search..." 
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
            />
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Quick Actions" className="px-2 py-1.5 text-xs font-medium text-gray-500">
              <Command.Item 
                onSelect={() => { router.push("/invoices/new?clear=true"); setOpen(false); }}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 hover:bg-gray-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Invoice</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-gray-100 my-1" />

            <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-gray-500">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 hover:bg-gray-100"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/invoices"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 hover:bg-gray-100"
              >
                <Receipt className="mr-2 h-4 w-4" />
                <span>Invoices</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/inventory"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 hover:bg-gray-100"
              >
                <Package className="mr-2 h-4 w-4" />
                <span>Inventory</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/parties"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 hover:bg-gray-100"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Parties (CRM)</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/expenses"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 hover:bg-gray-100"
              >
                <Wallet className="mr-2 h-4 w-4" />
                <span>Expenses</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/reports/gst"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 hover:bg-gray-100"
              >
                <FilePieChart className="mr-2 h-4 w-4" />
                <span>GST Reports</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-gray-100 my-1" />

            <Command.Group heading="Settings" className="px-2 py-1.5 text-xs font-medium text-gray-500">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/settings/profile"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 hover:bg-gray-100"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Business Profile</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
