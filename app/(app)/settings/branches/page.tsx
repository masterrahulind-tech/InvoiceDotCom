"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, MoreVertical } from "lucide-react";

export default function BranchesSettingsPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from /api/branches
    setBranches([
      { id: "1", name: "Main Branch", address: "HQ, India", isMain: true },
      { id: "2", name: "Warehouse", address: "Mumbai", isMain: false },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Branches</h2>
          <p className="text-sm text-gray-500">Manage multiple locations or warehouses.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Branch Name</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {branches.map((branch: any) => (
              <tr key={branch.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{branch.name}</span>
                    {branch.isMain && (
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 uppercase">
                        Main
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{branch.address || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-gray-400 hover:text-gray-900">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
