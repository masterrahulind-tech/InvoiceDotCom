import { prisma } from "@/lib/prisma";
import { CheckCircle2, XCircle, Search } from "lucide-react";

export default async function AdminTenantsPage() {
  const tenants = await prisma.businessProfile.findMany({
    include: {
      user: true,
      subscription: {
        include: { plan: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tenants & Users</h1>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, GSTIN..." 
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 whitespace-nowrap">Business Details</th>
                <th className="py-4 px-6 whitespace-nowrap">Owner</th>
                <th className="py-4 px-6 whitespace-nowrap">Vertical</th>
                <th className="py-4 px-6 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 whitespace-nowrap">Plan</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{tenant.businessName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">GST: {tenant.gstin || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{tenant.user.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{tenant.user.phone}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {tenant.vertical}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {tenant.isVerified ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <XCircle className="w-4 h-4" /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {tenant.subscription?.plan?.name || "Free Trial"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button className="text-sm font-medium text-black hover:underline">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No tenants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
