import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  ShieldAlert
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch the full user from DB to check systemRole
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!dbUser || dbUser.systemRole !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          You do not have the required permissions to view the Super Admin portal.
        </p>
        <Link 
          href="/dashboard"
          className="mt-6 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f5f7]">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-[#1f2029] text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            InvoiceDotCom
          </h2>
          <span className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1 block">Super Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link href="/admin/tenants" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm">Tenants & Users</span>
          </Link>
          <Link href="/admin/plans" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            <CreditCard className="w-5 h-5" />
            <span className="font-medium text-sm">Subscriptions</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
