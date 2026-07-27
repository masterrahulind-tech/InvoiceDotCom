import { prisma } from "@/lib/prisma";
import { Users, Building2, CreditCard, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  const [userCount, businessCount, subscriptionCount] = await Promise.all([
    prisma.user.count(),
    prisma.businessProfile.count(),
    prisma.tenantSubscription.count()
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{userCount}</h3>
            </div>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Tenants</p>
              <h3 className="text-2xl font-bold text-gray-900">{businessCount}</h3>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <h3 className="text-2xl font-bold text-gray-900">{subscriptionCount}</h3>
            </div>
          </div>
        </div>

        {/* MRR (Mocked for now) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">₹0</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart Placeholder */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400">Revenue Analytics Chart will appear here</p>
      </div>
    </div>
  );
}
