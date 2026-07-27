import { prisma } from "@/lib/prisma";
import { Plus, Check, MoreVertical } from "lucide-react";

export default async function AdminPlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { priceMonthly: "asc" }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        
        <button className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const features = JSON.parse(plan.features || "[]");
          
          return (
            <div key={plan.id} className={`bg-white rounded-2xl p-6 border ${plan.active ? 'border-gray-200' : 'border-gray-200 opacity-60'} relative flex flex-col`}>
              <div className="absolute top-4 right-4">
                <button className="text-gray-400 hover:text-black">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight text-gray-900">₹{plan.priceMonthly}</span>
                  <span className="text-sm font-medium text-gray-500">/mo</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">₹{plan.priceYearly} billed annually</div>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Included Features</p>
                <ul className="space-y-2.5">
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  plan.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.active ? 'Active' : 'Archived'}
                </span>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">No Plans Configured</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm text-center">
              You haven't set up any subscription tiers yet. Create your first plan to start monetizing.
            </p>
            <button className="mt-4 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Create Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
